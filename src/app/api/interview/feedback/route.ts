import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    if (isRateLimited(`${user.id}:interview-feedback`, 10, 60_000)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { question, answer, role, jobDesc } = body;

    if (!question || !answer) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Length caps to prevent API abuse
    if (question.length > 1000) {
      return Response.json({ error: "Question too long (max 1000 chars)" }, { status: 400 });
    }
    if (answer.length > 5000) {
      return Response.json({ error: "Answer too long (max 5000 chars)" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: z.object({
        score: z.number().min(0).max(100),
        strengths: z.array(z.string()).max(3),
        improvements: z.array(z.string()).max(3),
        model_answer_hint: z.string(),
      }),
      prompt: `You are a senior hiring manager evaluating a real candidate's interview answer. Be honest, specific, and constructive.

Role: ${(role ?? "").slice(0, 200)}
Question: ${question}
Candidate's Answer: ${answer}
Job Context: ${(jobDesc ?? "").slice(0, 500)}

SCORING RUBRIC (0-100):
- Relevance & specificity (25pts): Does the answer directly address the question with concrete details?
- Evidence & metrics (25pts): Does the candidate use real examples, numbers, or measurable outcomes?
- Structure & clarity (25pts): Is the answer organized? Does it follow STAR or a logical flow?
- Role alignment (25pts): Does the answer demonstrate the skills and mindset this specific role requires?

SCORING GUIDELINES:
- 85-100: Exceptional — specific, metrics-driven, perfectly aligned
- 70-84: Strong — good examples but missing metrics or depth
- 50-69: Average — relevant but vague, missing concrete evidence
- 30-49: Weak — too generic, no real examples
- 0-29: Poor — off-topic, too brief, or completely lacks substance

STRICT RULES:
- Do NOT be generous. A vague answer without specific examples scores below 55.
- Strengths must cite something SPECIFIC from the answer (not generic praise)
- Improvements must be ACTIONABLE and specific (not just "add more details")
- model_answer_hint: In 1-2 sentences, describe what a STRONG answer would emphasize — don't write the full answer`,
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate answer";
    return Response.json({ error: message }, { status: 500 });
  }
}
