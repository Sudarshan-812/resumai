// app/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResume(resumeText: string) {
  const model = genAi.getGenerativeModel({
    model: "gemini-2.5-flash", // use a current supported model
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are an expert ATS & Resume Coach.
Analyze the following resume text and output strictly JSON:

RESUME TEXT:
"${resumeText}"

Return:
{
  "ats_score": number,
  "summary_feedback": "string",
  "skills_found": ["skill1","skill2"],
  "missing_keywords": ["keyword1","keyword2"],
  "formatting_issues": ["issue1","issue2"]
}
`;

  const result = await model.generateContent(prompt);
  const response = result.response;

  // IMPORTANT: await the text
  const raw = await response.text();
  console.log("Gemini raw response (server):", raw?.slice ? raw.slice(0, 2000) : raw); // log first 2k chars

  if (!raw || raw.trim().length === 0) {
    const err: any = new Error("Empty response from Gemini");
    err.raw = raw;
    throw err;
  }

  // Try parse, attach raw on failure
  try {
    return JSON.parse(raw);
  } catch (parseErr: any) {
    parseErr.raw = raw;
    console.error("Failed to JSON.parse Gemini response:", parseErr);
    throw parseErr;
  }
}
