import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { chunkAndEmbedResume } from "@/app/lib/chunking";
import "@/env";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resume_id");

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: chunks, error } = await supabase
      .from("resume_chunks")
      .select("id, content, chunk_type")
      .eq("resume_id", resumeId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ chunks: chunks || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch chunks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { resume_id } = await req.json();

    if (!resume_id) {
      return NextResponse.json({ error: "Missing resume_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: resume } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resume_id)
      .eq("user_id", user.id)
      .single();

    if (!resume?.content) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const result = await chunkAndEmbedResume(resume_id, resume.content, user.id);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chunking failed" },
      { status: 500 }
    );
  }
}
