import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/app/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, resumeId } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch the resume analysis for context
  let context = "";
  if (resumeId) {
    const { data: resume } = await supabase
      .from("resumes")
      .select("file_name, ats_score, analysis")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resume) {
      context = `
Resume: ${resume.file_name}
ATS Score: ${resume.ats_score}
Analysis: ${JSON.stringify(resume.analysis, null, 2)}
`;
    }
  }

  const systemPrompt = `You are a professional resume coach and career advisor. You help users improve their resumes based on AI analysis results.

${context ? `Here is the resume analysis context:\n${context}` : ""}

Be concise, actionable, and specific. Focus on practical improvements. When suggesting rewrites, provide the exact new text. Format bullet improvements using the STAR method (Situation, Task, Action, Result). Keep responses under 300 words unless asked for more detail.`;

  const result = streamText({
    model: google("gemini-2.5-flash-preview-04-17"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
