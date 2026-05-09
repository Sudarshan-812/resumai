import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import "@/env";

// ── Schema ────────────────────────────────────────────────────────────────────

export const ATSEvaluationSchema = z.object({
  ats_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "ATS compatibility score 0-100 derived from the four-section weighted rubric"
    ),

  inferred_yoe: z
    .number()
    .describe(
      "Total professional years of experience computed from all work-history date ranges, expressed to one decimal place"
    ),

  summary_feedback: z
    .string()
    .describe(
      "Exactly 3-4 sentences: (1) overall verdict + score rationale, (2) single biggest strength, (3) single biggest gap, (4) one concrete action the candidate must take before reapplying"
    ),

  domain_skills: z
    .array(z.string())
    .describe(
      "Skills and technologies present in BOTH the resume and the job description, using the exact terminology from the JD"
    ),

  critical_missing_keywords: z
    .array(z.string())
    .describe(
      "JD requirements absent from the resume — prefix must-haves with [REQUIRED] and nice-to-haves with [PREFERRED]"
    ),

  formatting_issues: z
    .array(z.string())
    .describe(
      "ATS-hostile formatting problems, each expressed as a complete actionable sentence with a fix. Return an empty array if none found."
    ),

  bullet_evaluations: z
    .array(
      z.object({
        original_bullet: z
          .string()
          .describe("The exact weak bullet copied verbatim from the resume"),
        weakness_reason: z
          .string()
          .describe(
            "One concise sentence explaining why this bullet fails ATS or human review"
          ),
        optimized_suggestions: z
          .array(z.string())
          .length(3)
          .describe(
            "Exactly 3 rewritten versions using strong action verbs, STAR structure, and quantified metrics. Each must differ meaningfully in angle or phrasing."
          ),
      })
    )
    .describe(
      "Evaluations of the weakest experience bullets in the resume. Identify up to 5 bullets that lack metrics, use passive voice, or are too vague to pass ATS screening."
    ),
});

export type ATSEvaluation = z.infer<typeof ATSEvaluationSchema>;

// ── Core function ─────────────────────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ATSEvaluation> {
  const currentDate = new Date().toISOString().split("T")[0];

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-lite"),
      maxRetries: 2,
      schema: ATSEvaluationSchema,

      prompt: `
You are a defensive, highly precise B2B ATS evaluation engine combined with a Senior Technical Recruiter who has reviewed 10,000+ resumes at FAANG-tier companies.
Your output is consumed programmatically — every field must be accurate, grounded in the actual resume text, and free of hallucination.
Today's date is ${currentDate}. Use it for all date arithmetic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING RUBRIC — Compute ats_score / 100 with these exact weights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[40 pts] KEYWORD MATCH
  - Award points proportionally to how many REQUIRED skills/tools/technologies from the JD appear verbatim (or near-verbatim) in the resume.
  - Terms in the JD's "Requirements" or "Must Have" sections are worth 2x.
  - Synonyms count (e.g. "JS" = "JavaScript") but partial matches do not.

[25 pts] EXPERIENCE ALIGNMENT
  - Does the candidate's total YOE meet or exceed the JD requirement?
  - Full 25 pts if met. Deduct 5 pts per year of shortfall. 0 pts if gap > 4 years.
  - Also assess seniority trajectory (IC → Lead → Manager) against the JD's level.

[20 pts] SKILLS & DOMAIN DEPTH
  - Are matched skills demonstrated in experience bullets with real context, projects, or metrics — rather than just listed?
  - Penalise keyword stuffing (listed but never used in bullets). Award full 20 pts if ≥ 70% of matched skills appear with demonstrable context.

[15 pts] FORMATTING & ATS COMPATIBILITY
  - Start at 15. Deduct per ATS-hostile issue found:
    - Multi-column layout: -5 pts
    - Tables used for content: -4 pts
    - Images/graphics in content area: -4 pts
    - Text inside headers/footers: -3 pts
    - Missing standard sections (Work Experience, Education, Skills): -3 pts each
    - Inconsistent date formats: -2 pts
    - Font size below 10 pt: -2 pts
    - No measurable achievements (all responsibility bullets, zero metrics): -3 pts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUME TEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumeText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELD-LEVEL INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ats_score:
  Apply the rubric strictly. 85+ = realistically passes ATS. 60-84 = passes but needs work. Below 60 = likely filtered out.

inferred_yoe:
  Parse every work experience date range. Sum total months, convert to years (1 decimal). Use ${currentDate} for any "Present"/"Current" role. Exclude pure internships unless the JD is entry-level.

summary_feedback:
  Write exactly 3-4 sentences in the voice of a senior recruiter reviewing this resume for THIS specific role. Be direct; cite actual content. Sentence 1: verdict + score rationale. Sentence 2: single biggest strength. Sentence 3: single biggest gap. Sentence 4 (optional): one concrete action before reapplying (e.g. "Add your React version and a quantified metric to your most recent role before resubmitting.").

domain_skills:
  List ONLY skills/tools/technologies that appear in BOTH the JD AND the resume. Use the JD's exact terminology. Short items only (1-4 words). Exclude soft skills unless the JD explicitly requires them.

critical_missing_keywords:
  Prefix must-haves with [REQUIRED] and nice-to-haves with [PREFERRED]. Be specific — do not emit vague terms like "communication skills". Example: "[REQUIRED] Kubernetes", "[PREFERRED] GraphQL".

formatting_issues:
  Each item must be a complete, actionable sentence naming the issue and the fix. Return an empty array if the resume is ATS-clean.

bullet_evaluations:
  Identify up to 5 of the weakest experience bullets — those that use passive voice, are responsibility-only, lack numbers, or are too vague to survive ATS keyword scanning.
  For each:
    - original_bullet: copy the bullet verbatim from the resume
    - weakness_reason: one sentence on why it fails
    - optimized_suggestions: exactly 3 rewrites. Each must open with a strong past-tense action verb, follow STAR structure, and include at least one quantified outcome (%, $, users, time, team size). The three suggestions must differ meaningfully in emphasis or metric angle.
      `,
    });

    return object;
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to analyze resume with AI."
    );
  }
}
