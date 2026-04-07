import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/app/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { company, role, jobDesc, tone } = await req.json();

  if (!company || !role || !jobDesc) {
    return new Response("Missing fields", { status: 400 });
  }

  const toneGuide = {
    professional: "formal, polished, and confident",
    enthusiastic: "energetic, passionate, and personable",
    concise: "brief, direct, and impact-focused — under 200 words",
  }[tone as string] ?? "professional";

  const prompt = `Write a cover letter for the following application.

Company: ${company}
Role: ${role}
Job Description:
${jobDesc}

Tone: ${toneGuide}

Requirements:
- Address it to the hiring team (no specific name)
- Open with a strong hook that references the specific role and company
- 2-3 body paragraphs connecting the candidate's background to the JD requirements
- Close with a clear call to action
- Do NOT include placeholder brackets like [Your Name] — write it as a complete, ready-to-send letter
- Do NOT add any commentary before or after the letter itself`;

  const result = streamText({
    model: google("gemini-2.5-flash-preview-04-17"),
    prompt,
  });

  return result.toTextStreamResponse();
}
