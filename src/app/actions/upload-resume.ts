'use server'

import pdfParse from "pdf-parse";
import { analyzeResume } from '@/app/lib/gemini';
import { createClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function processResume(formData: FormData) {
  const file = formData.get('file') as File | null;
  const rawJobDescription = formData.get('jobDescription');

  const jobDescription = typeof rawJobDescription === 'string'
    ? rawJobDescription.trim()
    : "";

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Please log in to analyze resumes" };
  }

  if (!file || file.size === 0) {
    return { success: false, message: "No valid file uploaded" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: "File size must be under 5MB." };
  }

  if (!jobDescription || jobDescription === "undefined") {
    return { success: false, message: "Job Description is required for targeted analysis" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer, { pagerender: render_page, max: 0 });
    const text = data.text.trim();

    if (!text || text.length < 50) {
      return {
        success: false,
        message: "No readable text found in PDF",
        hint: "This is usually a scanned/image resume. Export as text PDF."
      };
    }

    const analysis = await analyzeResume(text, jobDescription);

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: file.name,
        content: text.slice(0, 150_000),
      })
      .select()
      .single();

    if (resumeError) {
      throw new Error("Failed to save resume to database.");
    }

    const baseAnalysisData = {
      resume_id: resume.id,
      user_id: user.id,
      ats_score: analysis.ats_score,
      summary_feedback: analysis.summary_feedback,
      skills_found: analysis.skills_found,
      missing_keywords: analysis.missing_keywords,
      formatting_issues: analysis.formatting_issues || [],
      job_description: jobDescription,
    };

    // Try with calculated_yoe; fall back without it if the column doesn't exist
    let { error: analysisError } = await supabase
      .from('analyses')
      .insert({ ...baseAnalysisData, calculated_yoe: Math.round(analysis.calculated_yoe ?? 0) });

    if (analysisError) {
      const { error: retryError } = await supabase
        .from('analyses')
        .insert(baseAnalysisData);
      if (retryError) {
        throw new Error(`Failed to save analysis: ${retryError.message}`);
      }
    }

    revalidatePath('/dashboard');
    return { success: true, data: analysis, id: resume.id };

  } catch (error: any) {
    return { success: false, message: error.message || "Analysis failed due to an unexpected error." };
  }
}
