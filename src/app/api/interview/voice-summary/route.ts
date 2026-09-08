import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

const BodySchema = z.object({
  resumeId: z.string().min(1),
  transcript: z.string().min(1).max(20_000),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { resumeId, transcript } = parsed.data;

    // Ownership enforced by the user_id filter — no cross-user access.
    const { data: resume } = await supabase
      .from("resumes")
      .select("content, analyses(job_description)")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    const analyses = (resume?.analyses ?? null) as { job_description: string }[] | null;
    const resumeText = (resume?.content ?? "").slice(0, 3_000);
    const jobDescription = (analyses?.[0]?.job_description ?? "").slice(0, 1_500);

    const cleaned = transcript.slice(0, 12_000).trim();

    // Not enough candidate speech to grade fairly.
    const candidateChars = cleaned
      .split("\n")
      .filter((l) => /^candidate:/i.test(l.trim()))
      .join(" ")
      .replace(/^candidate:/i, "")
      .trim().length;

    if (candidateChars < 120) {
      return Response.json({
        score: 0,
        summary: "The interview ended before there was enough spoken to evaluate. Start a new session and give each answer a few sentences.",
        strengths: [],
        improvements: [
          "Answer in 3–5 sentences using a concrete example.",
          "Structure answers as Situation → Action → Result.",
        ],
        highlight: "",
      });
    }

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: z.object({
        score: z.number().min(0).max(100),
        summary: z.string(),
        strengths: z.array(z.string()).max(4),
        improvements: z.array(z.string()).max(4),
        highlight: z.string().describe("The single question the candidate most needs to re-practice, quoted briefly."),
      }),
      prompt: `You are a senior hiring manager who just finished a spoken mock interview with a candidate. Evaluate the CANDIDATE's answers only (lines starting with "Candidate:"). Be honest, specific, and constructive.

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : "No job description was attached — evaluate for general interview quality.\n"}
${resumeText ? `CANDIDATE RESUME (context):\n${resumeText}\n` : ""}
INTERVIEW TRANSCRIPT:
${cleaned}

SCORING RUBRIC (0-100), average across the candidate's answers:
- Relevance & specificity (25): directly answers with concrete detail
- Evidence & metrics (25): real examples, numbers, measurable outcomes
- Structure & clarity (25): organized, follows a logical / STAR flow, not rambling
- Role alignment (25): shows the skills and judgement this job needs

GUIDELINES:
- Do NOT be generous. Vague answers with no examples score below 55.
- "strengths": cite something SPECIFIC the candidate actually said.
- "improvements": actionable and concrete, not "add more detail".
- "summary": 2 sentences, plain and direct, addressed to the candidate as "you".
- "highlight": name the one question they should re-practice.`,
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to summarize interview";
    return Response.json({ error: message }, { status: 500 });
  }
}
