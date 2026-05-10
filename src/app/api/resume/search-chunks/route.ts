import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "@/env";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text.slice(0, 8000));
  return result.embedding.values;
}

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

    const embedding = await getEmbedding(query);
    const embeddingStr = `[${embedding.join(",")}]`;

    const { data: chunks, error } = await supabase.rpc("search_resume_chunks", {
      query_embedding: embeddingStr,
      query_text: query,
      match_user_id: user.id,
      match_resume_id: resume_id || null,
      match_count: 10,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ chunks: chunks || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
