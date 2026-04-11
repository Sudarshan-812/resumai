import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import "@/env";

export async function analyzeResume(resumeText: string, jobDescription: string) {
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    const { object: analysis } = await generateObject({
      model: google("gemini-2.5-flash"),
      maxRetries: 2,
      schema: z.object({
        ats_score: z.number().min(0).max(100),
        calculated_yoe: z.number().describe("Total years of professional experience extracted from work history dates"),
        summary_feedback: z.string().describe("3-4 sentence recruiter-style verdict ending with one specific, actionable improvement the candidate must do immediately"),
        skills_found: z.array(z.string()).describe("Skills and keywords explicitly present in the resume that also appear in the JD"),
        missing_keywords: z.array(z.string()).describe("Must-have and nice-to-have keywords from the JD that are absent from the resume"),
        formatting_issues: z.array(z.string()).describe("ATS-hostile formatting problems detected in the resume"),
      }),

      prompt: `
You are a Principal ATS Engine combined with a Senior Technical Recruiter with 15 years of experience at FAANG companies.
Your job is to produce a precise, ruthlessly honest, and highly actionable resume analysis.
Today's date is ${currentDate}. Use this for all date calculations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING RUBRIC — Calculate ats_score out of 100 using these exact weights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[40 pts] KEYWORD MATCH
  - Award points proportional to how many REQUIRED skills/tools/technologies from the JD appear verbatim (or near-verbatim) in the resume.
  - Terms that appear in the JD's "Requirements" or "Must Have" sections are worth 2x.
  - Synonyms count (e.g., "JS" = "JavaScript") but partial matches do not.

[25 pts] EXPERIENCE ALIGNMENT
  - Does the candidate's total YOE meet or exceed what the JD requires?
  - Full 25 pts if YOE meets requirement. Deduct 5 pts per year of shortfall. 0 pts if gap > 4 years.
  - Also assess seniority alignment: does the candidate's role trajectory (IC → Lead → Manager) match the JD's level?

[20 pts] SKILLS & DOMAIN DEPTH
  - Are the matched skills demonstrated with real context (projects, metrics, impact) rather than just listed?
  - Penalize keyword stuffing (listed but never demonstrated in experience bullets).
  - Award full points if ≥70% of matched skills appear in experience context.

[15 pts] FORMATTING & ATS COMPATIBILITY
  - Start at 15. Deduct for each ATS-hostile issue found:
    - Multi-column layout: -5 pts
    - Tables used for content: -4 pts
    - Images/graphics in content area: -4 pts
    - Text inside headers/footers: -3 pts
    - Missing standard sections (Work Experience, Education, Skills): -3 pts each
    - Inconsistent date formats: -2 pts
    - Font size below 10pt: -2 pts
    - No measurable achievements (all responsibility bullets, zero metrics): -3 pts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DESCRIPTION TO ANALYZE AGAINST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME TEXT TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumeText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS FOR EACH OUTPUT FIELD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ats_score:
  Apply the rubric above. Be strict. A score of 85+ means this resume would realistically pass the ATS screen. 60-84 means it passes but needs work. Below 60 means it will likely be filtered out.

calculated_yoe:
  Parse all work experience date ranges. Calculate the total months worked, convert to years (1 decimal place). Use ${currentDate} as the end date for any "Present" / "Current" positions. Exclude internships from professional YOE unless the JD is entry-level.

summary_feedback:
  Write exactly 3-4 sentences in the voice of a senior recruiter reviewing this resume for THIS specific role. Be direct, specific, and reference actual content from the resume and JD. Sentence 1: overall verdict and score rationale. Sentence 2: the single biggest strength. Sentence 3: the single biggest gap. Sentence 4: ONE specific action the candidate must take before re-applying (e.g., "Add your React version experience and a quantified metric to your most recent role before resubmitting.").

skills_found:
  List ONLY skills/tools/technologies that (a) appear in the JD AND (b) are present in the resume. Use the exact terminology from the JD, not the resume. Keep each item short (1-4 words). Do not include soft skills unless the JD explicitly requires them.

missing_keywords:
  List skills/tools/technologies the JD requires or strongly prefers that are absent from the resume. Prefix must-haves with "[REQUIRED]" and nice-to-haves with "[PREFERRED]". Example: "[REQUIRED] Kubernetes", "[PREFERRED] GraphQL". Be specific — do not list vague terms like "communication skills".

formatting_issues:
  List each ATS-hostile formatting problem found. Each item must be a complete, actionable sentence. Example: "Multi-column layout detected — ATS parsers read columns as garbled text. Convert to single-column format." If no issues are found, return an empty array — do not fabricate issues.
      `,
    });

    return analysis;

  } catch (error: any) {
    throw new Error(error.message || "Failed to analyze resume with AI.");
  }
}
