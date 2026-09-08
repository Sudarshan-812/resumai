import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";
import { RUBRIC_BLOCK } from "@/app/lib/interview-rubric";
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
      model: groq("llama-3.3-70b-versatile"),
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

${RUBRIC_BLOCK}

- model_answer_hint: In 1-2 sentences, describe what a STRONG answer would emphasise - do not write the full answer.`,
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate answer";
    return Response.json({ error: message }, { status: 500 });
  }
}
