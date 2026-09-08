import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { retrieveForJD } from "@/app/lib/retrieval";
import "@/env";

export async function POST(req: Request) {
  try {
    const { query, resume_id } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // hybrid search (dense + BM25 + RRF) -> LLM rerank. `similarity` on the
    // returned chunks is the reranker's 0-1 relevance score.
    const chunks = await retrieveForJD(supabase, {
      userId: user.id,
      resumeId: resume_id || null,
      jd: query,
      topN: 10,
    });

    return NextResponse.json({ chunks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
