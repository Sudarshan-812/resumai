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
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
        maxOutputTokens: 300,
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  const textOutput = json?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(json);

  return { ok: res.ok, status: res.status, provider: "gemini", data: json, text: textOutput };
}

export async function GET() {
  try {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!OPENAI_KEY && !GEMINI_KEY) {
      return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY or GEMINI_API_KEY in .env" }, { status: 500 });
    }

    const prompt = `Server LLM test — say "Hello, Gemini 2.0 is active!" and include timestamp: ${new Date().toISOString()}`;

    if (OPENAI_KEY) {
      const result = await callOpenAI(prompt, OPENAI_KEY);
      return NextResponse.json(result, { status: result.status ?? 200 });
    } else {
      const result = await callGemini(prompt, GEMINI_KEY!);
      return NextResponse.json(result, { status: result.status ?? 200 });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
