import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@/app/lib/supabase/server";
import { getEmbedding } from "@/app/lib/embedding";
export const maxDuration = 60;

/** Hybrid-retrieve the resume sections most relevant to the user's question and
 *  render them as labelled, citable blocks. Best-effort - any failure just
 *  yields an empty string and the chat falls back to the full resume text. */
async function retrieveRelevantSections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resumeId: string,
  question: string
): Promise<string> {
  if (!question.trim()) return "";
  try {
    const embedding = await getEmbedding(question, "RETRIEVAL_QUERY");
    const embeddingStr = `[${embedding.join(",")}]`;

    let { data: chunks, error } = await supabase.rpc("search_resume_chunks_hybrid", {
      query_embedding: embeddingStr,
      query_text: question,
      match_user_id: userId,
      match_resume_id: resumeId,
      match_count: 6,
    });
    if (error && /hybrid|does not exist/i.test(error.message)) {
      ({ data: chunks, error } = await supabase.rpc("search_resume_chunks", {
        query_embedding: embeddingStr,
        query_text: question,
        match_user_id: userId,
        match_resume_id: resumeId,
        match_count: 6,
      }));
    }
    if (error || !Array.isArray(chunks) || chunks.length === 0) return "";

    const blocks = (chunks as { content: string }[])
      .map((c, i) => `[S${i + 1}]\n${c.content.trim()}`)
      .join("\n\n");
    return `
════════════════════════════════════════
RETRIEVED RESUME SECTIONS (most relevant to this question - cite as [S1], [S2], ...):
${blocks}
════════════════════════════════════════
`;
  } catch (err) {
    console.error("[chat] retrieval failed (non-fatal):", err);
    return "";
  }
}

export async function POST(req: Request) {
  const { messages, resumeId, latexCode } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const lastUserMessage =
    [...messages].reverse().find((m) => m?.role === "user")?.content ?? "";
  const retrievedSections =
    resumeId && typeof lastUserMessage === "string"
      ? await retrieveRelevantSections(supabase, user.id, resumeId, lastUserMessage)
      : "";

  let context = "";
  if (resumeId) {
    const [resumeRes, analysisRes] = await Promise.all([
      supabase
        .from("resumes")
        .select("file_name, content")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("analyses")
        .select("ats_score, summary_feedback, skills_found, missing_keywords, formatting_issues, job_description, calculated_yoe")
        .eq("resume_id", resumeId)
        .eq("user_id", user.id)
        .single(),
    ]);

    if (resumeRes.data && analysisRes.data) {
      const a = analysisRes.data;
      const resumeContent = resumeRes.data.content || "";
      context = `
════════════════════════════════════════
RESUME FILE: ${resumeRes.data.file_name}
ATS SCORE: ${a.ats_score}/100
YEARS OF EXPERIENCE: ${a.calculated_yoe ?? "unknown"}
════════════════════════════════════════

FULL RESUME TEXT (use this to quote exact content):
---
${resumeContent.slice(0, 6000)}
---

ANALYSIS RESULTS:
- Summary: ${a.summary_feedback}
- Skills matched to JD: ${a.skills_found?.join(", ") || "none"}
- Missing keywords: ${a.missing_keywords?.join(", ") || "none"}
- Formatting issues: ${a.formatting_issues?.join("; ") || "none"}

TARGET JOB DESCRIPTION:
---
${a.job_description?.slice(0, 1500) || "not provided"}
---
`;
    }
  }

  const latexContext = latexCode
    ? `
════════════════════════════════════════
CURRENT LATEX RESUME SOURCE:
\`\`\`latex
${latexCode.slice(0, 6000)}
\`\`\`
════════════════════════════════════════
`
    : "";

  const systemPrompt = `You are an elite resume coach who has helped 500+ candidates land jobs at top companies. You have the candidate's FULL resume text, detailed ATS analysis, and the current LaTeX source in front of you.

${context ? context : "No resume context provided - give sharp, general resume advice."}
${retrievedSections}${latexContext}

GROUNDING RULES:
- The RETRIEVED RESUME SECTIONS and FULL RESUME TEXT above are the source of truth for what is actually on the resume. Never invent experience, employers, dates, or metrics the candidate did not write.
- When you quote or reference something from the resume, cite the section label inline, e.g. [S2]. If you use the full resume text instead, quote it verbatim.
- If the user asks about something that is not in the resume text you were given, say plainly that you don't see it - do not guess.

COACHING RULES:
1. QUOTE THE EXACT TEXT you're referencing from the resume before suggesting changes
2. For rewrites, always show: BEFORE → AFTER format
3. Use action verbs: Led, Built, Increased, Reduced, Delivered, Architected, Drove
4. Add metrics wherever possible (%, $, users, team size, time saved)
5. Mirror the exact language from the job description when applicable
6. Be direct and honest - if something is weak, say so clearly
7. Keep responses focused. Use bullet points for lists.
8. When rewriting bullets, use STAR format: Action + Situation + Impact (with number)

LATEX UPDATE RULES (only when the user asks you to change/fix/rewrite the resume):
- First explain what you're changing and why (2-3 sentences max)
- Then return the COMPLETE updated LaTeX document in a single code block:
  \`\`\`latex
  [full document here]
  \`\`\`
- The code block MUST contain the entire document from \\documentclass to \\end{document}
- Do NOT return partial LaTeX - always the full document
- If the user is just asking a question (not requesting a change), do NOT return a LaTeX block

Example rewrite format:
BEFORE: "Worked on improving app performance"
AFTER: "Reduced app load time by 40% (3.2s → 1.9s) by implementing Redis caching and lazy-loading strategies"`;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
    maxOutputTokens: 2048,
  });

  return result.toTextStreamResponse();
}
