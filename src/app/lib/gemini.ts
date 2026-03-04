import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Ensure the API Key is present
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export async function analyzeResume(resumeText: string, jobDescription: string) {
  // Grab today's date so the AI doesn't hallucinate that 2025/2026 is "in the future"
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    const { object: analysis } = await generateObject({
      // 1. FIXED: Using the correct API string for a model where you actually have free quota
      model: google("gemini-2.5-flash"), 
      
      // 2. FIXED: Stop the SDK from auto-retrying and burning your 5 RPM limit
      maxRetries: 0, 
      
      // Enforce a strict schema that matches your DB columns
      schema: z.object({
        ats_score: z.number().min(0).max(100),
        calculated_yoe: z.number().describe("Total years of experience extracted from dates"),
        summary_feedback: z.string(),
        skills_found: z.array(z.string()),
        missing_keywords: z.array(z.string()),
        formatting_issues: z.array(z.string()),
      }),
      
      prompt: `
        You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
        Analyze the following Resume against the provided Job Description.
        
        IMPORTANT CONTEXT: Assume today's date is ${currentDate}. Use this exact date to correctly calculate Years of Experience (YOE) and verify project timelines. Do not flag past dates from 2024 or 2025 as being "in the future".
        
        TARGET JOB DESCRIPTION:
        "${jobDescription}"
        
        RESUME TEXT:
        "${resumeText}"
        
        TASKS:
        1. Calculate an ATS score (0-100) based on keyword matching and experience requirements.
        2. Calculate total Years of Experience (YOE) from the resume work history using today's date (${currentDate}).
        3. Identify skills found that match the JD.
        4. Identify missing keywords/skills required by the JD.
        5. List any formatting issues (e.g., unreadable text, poor structure).
        6. Provide a concise summary feedback.
      `,
    });

    console.log("Analysis successful for:", resumeText.slice(0, 50) + "...");
    return analysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Fallback for UI if AI fails
    throw new Error(error.message || "Failed to analyze resume with AI.");
  }
}