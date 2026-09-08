import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export const runtime = "nodejs";

/** Recent mock interviews (voice + text) for the signed-in user. */
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(
    50,
    Math.max(1, parseInt(new URL(req.url).searchParams.get("limit") ?? "20", 10) || 20)
  );

  const { data, error } = await supabase
    .from("interviews")
    .select(
      "id, mode, role, score, summary, highlight, strengths, improvements, resume_id, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    // Table not migrated yet -> empty history rather than a hard error.
    if (/relation .*interviews.* does not exist/i.test(error.message)) {
      return NextResponse.json({ interviews: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data ?? [] });
}
