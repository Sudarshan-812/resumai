import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { analyzeResume } from "@/app/lib/gemini";
import "@/env";

const SECTION_ORDER = ["summary", "experience", "education", "skills", "project"];

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: versions, error } = await supabase
      .from("resume_versions")
      .select(
        "id, version_name, ats_score, created_at, job_description, parent_resume_id"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ versions: versions || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { parent_resume_id, version_name, job_description, selected_chunks } =
      await req.json();

    if (!parent_resume_id || !version_name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Array.isArray(selected_chunks) || selected_chunks.length === 0) {
      return NextResponse.json({ error: "No chunks selected" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sorted = [...selected_chunks].sort(
      (a, b) =>
        SECTION_ORDER.indexOf(a.chunk_type) - SECTION_ORDER.indexOf(b.chunk_type)
    );
    const combinedContent = sorted
      .map((c: { content: string }) => c.content.trim())
      .join("\n\n");

    // Issue 12: Use null (not 0) for unanalysed/failed — client already handles null correctly
    let ats_score: number | null = null;
    if (job_description?.trim() && combinedContent.length > 50) {
      try {
        const analysis = await analyzeResume(combinedContent, job_description);
        ats_score = analysis.ats_score;
      } catch (err) {
        console.error("[versions] ATS analysis failed (non-fatal):", err);
        // ats_score stays null — version still saves
      }
    }

    const { data: version, error } = await supabase
      .from("resume_versions")
      .insert({
        user_id: user.id,
        parent_resume_id,
        version_name: version_name.trim(),
        content: combinedContent,
        job_description: job_description || null,
        ats_score,
        selected_chunk_ids: selected_chunks.map((c: { id: string }) => c.id),
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ version_id: version.id, ats_score });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create version" },
      { status: 500 }
    );
  }
}
