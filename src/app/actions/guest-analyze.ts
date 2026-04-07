"use server";

import pdfParse from "pdf-parse";
import { analyzeResume } from "@/app/lib/gemini";

const render_page = (pageData: any) => {
  return pageData.getTextContent().then((textContent: any) => {
    let lastY: number | null = null;
    let text = "";
    for (const item of textContent.items) {
      const y = item.transform[5];
      if (lastY !== y && lastY !== null) text += "\n";
      lastY = y;
      text += item.str;
    }
    return text;
  }).catch(() => "");
};

export async function analyzeResumeAsGuest(formData: FormData) {
  const file = formData.get("file") as File | null;
  const rawJD = formData.get("jobDescription");
  const jobDescription = typeof rawJD === "string" ? rawJD.trim() : "";

  if (!file || file.size === 0) {
    return { success: false as const, message: "No valid file uploaded." };
  }

  if (!jobDescription) {
    return { success: false as const, message: "Job Description is required." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false as const, message: "File size must be under 5MB." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer, { pagerender: render_page, max: 0 });
    const text = data.text.trim();

    if (!text || text.length < 50) {
      return {
        success: false as const,
        message: "No readable text found in PDF. Please export as a text-based PDF (not a scanned image).",
      };
    }

    const analysis = await analyzeResume(text, jobDescription);

    // Return data directly — no DB save for guests
    return {
      success: true as const,
      data: {
        ats_score: analysis.ats_score,
        calculated_yoe: analysis.calculated_yoe,
        summary_feedback: analysis.summary_feedback,
        skills_found: analysis.skills_found,
        missing_keywords: analysis.missing_keywords,
        formatting_issues: analysis.formatting_issues,
        file_name: file.name,
      },
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || "Analysis failed. Please try again.",
    };
  }
}
