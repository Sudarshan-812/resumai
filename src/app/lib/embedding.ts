const GEMINI_EMBEDDING_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/embedding-001";

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${GEMINI_EMBEDDING_URL}:embedContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      content: { parts: [{ text: text.slice(0, 2048) }] },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.embedding.values;
}

export async function getBatchEmbeddings(
  texts: string[]
): Promise<(number[] | null)[]> {
  if (texts.length === 0) return [];

  const response = await fetch(`${GEMINI_EMBEDDING_URL}:batchEmbedContents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: "models/embedding-001",
        content: { parts: [{ text: text.slice(0, 2048) }] },
      })),
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));

  return (data.embeddings as Array<{ values: number[] } | null>).map(
    (e) => e?.values ?? null
  );
}
