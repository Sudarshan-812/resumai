'use server'

import pdfParse from "pdf-parse";
import { analyzeResume } from '@/app/lib/gemini';
import { createClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { chunkAndEmbedResume } from '@/app/lib/chunking';
import { render_page } from '@/app/lib/pdf';
import { sendAnalysisDoneEmail } from '@/app/lib/email';

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
        content: text,
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
      skills_found: analysis.domain_skills,
      missing_keywords: analysis.critical_missing_keywords,
      formatting_issues: analysis.formatting_issues ?? [],
      job_description: jobDescription,
    };

    // Try with calculated_yoe; fall back without it if the column doesn't exist yet
    let { error: analysisError } = await supabase
      .from('analyses')
      .insert({ ...baseAnalysisData, calculated_yoe: Math.round(analysis.inferred_yoe ?? 0) });

    if (analysisError) {
      const { error: retryError } = await supabase
        .from('analyses')
        .insert(baseAnalysisData);
      if (retryError) {
        throw new Error(`Failed to save analysis: ${retryError.message}`);
      }
    }

    revalidatePath('/dashboard');

    // Background tasks: chunking + email notification — run after response is sent
    after(async () => {
      await Promise.allSettled([
        chunkAndEmbedResume(resume.id, text, user.id).catch(err =>
          console.error("[upload] background chunking failed:", err)
        ),
        user.email
          ? sendAnalysisDoneEmail({
              to: user.email,
              fileName: file.name,
              atsScore: analysis.ats_score,
              resumeId: resume.id,
            }).catch(() => {})
          : Promise.resolve(),
      ]);
    });

    return { success: true, data: analysis, id: resume.id, truncated: false };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed due to an unexpected error.";
    return { success: false, message };
  }
}
