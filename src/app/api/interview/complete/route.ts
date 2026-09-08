import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

const ItemSchema = z.object({
  question: z.string().max(2_000),
  category: z.string().max(60).optional(),
  answer: z.string().max(8_000),
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).max(5).default([]),
  improvements: z.array(z.string()).max(5).default([]),
  model_answer_hint: z.string().max(2_000).optional(),
});

const BodySchema = z.object({
  role: z.string().max(200).optional(),
  jobDesc: z.string().max(12_000).optional(),
  items: z.array(ItemSchema).min(1).max(12),
});

/** Persist one row per completed text mock interview. Fire-and-forget from the
 *  client - a failure here is non-fatal to the user's session. */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { role, jobDesc, items } = parsed.data;

    const avg = Math.round(items.reduce((s, it) => s + it.score, 0) / items.length);
    const transcript = items
      .map((it, i) => `Q${i + 1} (${it.category ?? "general"}): ${it.question}\nA: ${it.answer}`)
      .join("\n\n");

    const { data: row, error } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        mode: "text",
        role: role || null,
        job_description: jobDesc?.slice(0, 8_000) || null,
        transcript: transcript.slice(0, 16_000),
        score: avg,
        per_question: items,
      })
      .select("id")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ interviewId: row.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save interview";
    return Response.json({ error: message }, { status: 500 });
  }
}
