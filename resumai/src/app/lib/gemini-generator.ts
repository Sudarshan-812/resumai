import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateContent(prompt: string) {
  try {
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content from AI");
  }
}

// Keep helper for backward compatibility
export async function generateCoverLetter(resumeText: string, jobDescription: string) {
  const prompt = `
    Based on this resume: ${resumeText}
    And this job description: ${jobDescription}
    Write a professional cover letter.
  `;
  return generateContent(prompt);
}