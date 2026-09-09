// Last-resort resume parser: hand the raw PDF to Gemini's multimodal model and
// ask for structured Markdown. Only worth calling when both pdf-parse and the
// docling service (structural-parse.ts) come back weak - broken multi-column
// layouts and poor scans that layout models still trip on. Best-effort: any
// failure returns null and the caller keeps whatever text it already had.

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import "@/env";

// GA Flash - the 3.x Flash previews return frequent 503 "overloaded" on the
// free tier. Revisit once a newer Flash reaches GA with real capacity.
const MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 30_000;

export async function parseResumeWithGemini(
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: google(MODEL),
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      system:
        "You are a document parser. Convert the attached resume to clean " +
        "GitHub-flavored Markdown. Preserve section headings as '## Heading', " +
        "keep tables as Markdown tables, and follow natural reading order for " +
        "multi-column layouts (read the left column fully, then the right). Do " +
        "not summarize, reorder sections, drop content, or invent anything. " +
        "Output only the Markdown.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Parse this resume to Markdown." },
            {
              type: "file",
              data: buffer,
              mediaType: "application/pdf",
              filename,
            },
          ],
        },
      ],
    });
    const out = text.trim();
    return out.length > 0 ? out : null;
  } catch (err) {
    console.error("[pdf-vision] Gemini parse failed (non-fatal):", err);
    return null;
  }
}
