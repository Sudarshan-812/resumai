interface PDFTextItem {
  str: string;
  transform: number[];
  width?: number;
}

interface PDFPageData {
  getTextContent: () => Promise<{ items: PDFTextItem[] }>;
}

// Two items on the same visual line can still land on slightly different
// baselines (kerning/sub-pixel rounding). Treat anything within this many
// PDF points as "the same line" so section headers don't get split across
// multiple detected lines (which would break keyword-based section detection).
const LINE_Y_TOLERANCE = 2;

// Gap thresholds (in PDF points) used to decide whether adjacent text runs
// on the same line need a space inserted between them. pdf.js frequently
// emits separate runs (different font/style, or literal tab-stops like a
// right-aligned date) with no space character at all.
const WORD_GAP_PT = 1.5;
const WIDE_GAP_PT = 18;

const LIGATURES: Record<string, string> = {
  "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl",
  "‘": "'", "’": "'", "“": '"', "”": '"',
  "–": "-", "—": "-",
  "•": "-", "●": "-", "▪": "-", "‣": "-", "⁃": "-",
  " ": " ",
};

// Control/zero-width characters that sometimes leak in from broken font
// encodings - stripped entirely rather than mapped to anything visible.
const STRIP_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\uFEFF]/g;

function normalizeChars(str: string): string {
  let out = "";
  for (const ch of str) out += LIGATURES[ch] ?? ch;
  return out.replace(STRIP_CHARS, "");
}

export const render_page = (pageData: PDFPageData) => {
  return pageData
    .getTextContent()
    .then(({ items }) => {
      const runs = items
        .filter((it) => it.str.length > 0)
        .map((it) => ({
          str: it.str,
          x: it.transform[4],
          y: it.transform[5],
          // pdf.js always supplies `width` in practice; this is only a safety
          // net for malformed input, so it deliberately underestimates
          // (average glyph is ~0.5x the font's horizontal scale) rather than
          // risk masking a real gap between words.
          width: it.width ?? it.str.length * Math.abs(it.transform[0] || 6) * 0.5,
        }));

      if (runs.length === 0) return "";

      let text = "";
      let lastY: number | null = null;
      let lastX: number | null = null;
      let lastRight: number | null = null;

      for (const run of runs) {
        const sameLine = lastY !== null && Math.abs(lastY - run.y) <= LINE_Y_TOLERANCE;

        if (!sameLine) {
          if (lastY !== null) text += "\n";
        } else if (lastRight !== null) {
          const gap = run.x - lastRight;
          if (gap > WIDE_GAP_PT) text += "   ";
          else if (gap > WORD_GAP_PT) text += " ";
          else if (gap < -WORD_GAP_PT && lastX !== null && run.x < lastX) {
            // Overlapping/reversed run (rare RTL or bad kerning artifact) - just add a space guard.
            text += " ";
          }
        }

        text += run.str;
        lastY = run.y;
        lastX = run.x;
        lastRight = run.x + Math.max(run.width, 0);
      }

      return normalizeChars(text);
    })
    .catch(() => "");
};

/**
 * Heuristic check for whether extracted text is real prose vs. extraction
 * noise (common for scanned/image-only PDFs, where pdf.js may still emit a
 * handful of stray glyphs, or corrupted-encoding PDFs that decode to symbols).
 */
export function looksLikeGarbledText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 50) return true;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 15) return true;

  const alnum = (trimmed.match(/[a-zA-Z0-9]/g) ?? []).length;
  if (alnum / trimmed.length < 0.55) return true;

  const replacementChars = (trimmed.match(/�/g) ?? []).length;
  if (replacementChars / trimmed.length > 0.01) return true;

  // Real prose has a healthy mix of word lengths; pure noise tends to be
  // almost all single characters (e.g. "a a a a a") or one giant run-on token.
  const singleCharWords = words.filter((w) => w.length === 1).length;
  if (singleCharWords / words.length > 0.5) return true;

  const longestWord = Math.max(...words.map((w) => w.length));
  if (longestWord > 200) return true;

  return false;
}
