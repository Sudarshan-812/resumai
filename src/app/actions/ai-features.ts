'use server'

import { createClient } from "@/app/lib/supabase/server";
import { generateContent } from "@/app/lib/gemini-generator";

export async function generateCareerDoc(
  resumeId: string,
  jobDescription: string,
  type: 'cover_letter' | 'interview_prep'
): Promise<string | { questions: { question: string; answer: string }[] }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Server Error: API Key is missing.");
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { data: resume, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error || !resume) throw new Error("Resume not found");

  let context = "";
  if (resume.content) {
    context = resume.content;
  } else if (resume.original_analysis) {
    const analysis = typeof resume.original_analysis === 'string'
      ? JSON.parse(resume.original_analysis)
      : resume.original_analysis;
    context = JSON.stringify(analysis);
  } else {
    context = "User resume data.";
  }

  const prompt =
    type === 'cover_letter'
      ? `You are an expert career coach. Write a professional cover letter for the following Job Description:
"${jobDescription}"

Using the candidate's background details here:
${context}

Keep it concise, professional, and highlight matching skills.
Output ONLY the cover letter text.`
      : `You are an expert technical recruiter. Based on this Job Description:
"${jobDescription}"

And this candidate's resume:
${context}

Generate 5 likely interview questions and brief suggested answers.
Return the output in this specific JSON format (do not use markdown code blocks):
{
  "questions": [
    { "question": "...", "answer": "..." }
  ]
}`;

  const result = await generateContent(prompt);

  if (type === 'interview_prep') {
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse AI response as JSON.");
    }
  }

  return result;
}
