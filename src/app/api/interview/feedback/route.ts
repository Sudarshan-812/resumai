import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

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
      model: google("gemini-2.5-flash-preview-04-17"),
      schema: z.object({
        score: z.number().min(0).max(100),
        strengths: z.array(z.string()).max(3),
        improvements: z.array(z.string()).max(3),
        model_answer_hint: z.string(),
      }),
      prompt: `Evaluate this interview answer for a ${(role ?? "").slice(0, 200)} role.

Question: ${question}

Candidate's Answer: ${answer}

Job context: ${(jobDesc ?? "").slice(0, 500)}

Score the answer from 0-100 based on:
- Relevance and specificity (25pts)
- Use of concrete examples/metrics (25pts)
- Structure and clarity (25pts)
- Alignment with role requirements (25pts)

Provide:
- 1-3 specific strengths of the answer
- 1-3 specific improvements needed
- A brief hint at what a strong answer would include (1-2 sentences, not a full answer)

Be honest and constructive. Don't be too generous — a vague answer without examples should score below 50.`,
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate answer";
    return Response.json({ error: message }, { status: 500 });
  }
}
