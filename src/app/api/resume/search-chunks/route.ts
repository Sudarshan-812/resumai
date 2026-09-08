import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getEmbedding } from "@/app/lib/embedding";
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

    const embedding = await getEmbedding(query, "RETRIEVAL_QUERY");
    const embeddingStr = `[${embedding.join(",")}]`;

    // Hybrid: dense (pgvector) + BM25 (FTS) fused via Reciprocal Rank Fusion.
    // Falls back to the pure-cosine RPC if migration 002 hasn't been applied.
    let { data: chunks, error } = await supabase.rpc("search_resume_chunks_hybrid", {
      query_embedding: embeddingStr,
      query_text: query,
      match_user_id: user.id,
      match_resume_id: resume_id || null,
      match_count: 10,
    });

    if (error && /search_resume_chunks_hybrid|function .* does not exist/i.test(error.message)) {
      ({ data: chunks, error } = await supabase.rpc("search_resume_chunks", {
        query_embedding: embeddingStr,
        query_text: query,
        match_user_id: user.id,
        match_resume_id: resume_id || null,
        match_count: 10,
      }));
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ chunks: chunks || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
