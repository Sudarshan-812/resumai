// src/app/api/analyze/ai-llm/route.ts
import { NextResponse } from "next/server";

async function callOpenAI(prompt: string, key: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    const content = json?.choices?.[0]?.message?.content ?? text;
    return { ok: res.ok, status: res.status, provider: "openai", data: json, text: content };
  } catch {
    return { ok: res.ok, status: res.status, provider: "openai", data: text, text };
  }
}

async function callGemini(prompt: string, key: string) {
  // Use Google Generative Language REST endpoint with API key query parameter
  // NOTE: ensure Generative Language API is enabled and key has billing/permissions
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate?key=${encodeURIComponent(
    key
  )}`;

  const body = {
    // simple text prompt form — keeps compatibility across clients
    prompt: {
      text: prompt,
    },
    maxOutputTokens: 300,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  // Gemini/Generative Language returns candidates[0].output or "candidates"
  const textOutput =
    json?.candidates?.[0]?.output ||
    json?.candidates?.[0]?.content?.[0]?.text ||
    JSON.stringify(json);

  return { ok: res.ok, status: res.status, provider: "gemini", data: json, text: textOutput };
}

export async function GET() {
  try {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!OPENAI_KEY && !GEMINI_KEY) {
      return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY or GEMINI_API_KEY" }, { status: 500 });
    }

    const prompt = `Server LLM test — say "hello" and include timestamp: ${new Date().toISOString()}`;

    if (OPENAI_KEY) {
      const result = await callOpenAI(prompt, OPENAI_KEY);
      return NextResponse.json(result, { status: result.status ?? 200 });
    } else {
      // Use Gemini
      const result = await callGemini(prompt, GEMINI_KEY!);
      return NextResponse.json(result, { status: result.status ?? 200 });
    }
  } catch (err: any) {
    console.error("AI LLM route error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
