import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/app/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, resumeId } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let context = "";
  if (resumeId) {
    // Fetch resume and its analysis from the correct tables
    const [resumeRes, analysisRes] = await Promise.all([
      supabase
        .from("resumes")
        .select("file_name")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("analyses")
        .select("ats_score, summary_feedback, skills_found, missing_keywords, formatting_issues, job_description")
        .eq("resume_id", resumeId)
        .eq("user_id", user.id)
        .single(),
    ]);

    if (resumeRes.data && analysisRes.data) {
      const a = analysisRes.data;
      context = `
Resume: ${resumeRes.data.file_name}
ATS Score: ${a.ats_score}/100
Summary: ${a.summary_feedback}
Skills Found: ${a.skills_found?.join(", ") ?? "none"}
Missing Keywords: ${a.missing_keywords?.join(", ") ?? "none"}
Formatting Issues: ${a.formatting_issues?.join("; ") ?? "none"}
Job Description Targeted: ${a.job_description?.slice(0, 500) ?? "not provided"}
`;
    }
  }

  const systemPrompt = `You are a professional resume coach and career advisor. You help users improve their resumes based on AI analysis results.

${context ? `Here is the resume analysis context:\n${context}` : "No resume context provided — give general resume advice."}

Be concise, actionable, and specific. Focus on practical improvements. When suggesting rewrites, provide the exact new text. Format bullet improvements using the STAR method (Situation, Task, Action, Result). Keep responses under 300 words unless asked for more detail.`;

  const result = streamText({
    model: google("gemini-2.5-flash-preview-04-17"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
