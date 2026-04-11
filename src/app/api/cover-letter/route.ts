import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/app/lib/supabase/server";

export const maxDuration = 60;

const VALID_TONES = ["professional", "enthusiastic", "concise"] as const;
type Tone = typeof VALID_TONES[number];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { company, role, jobDesc, tone } = body;

    if (!company || !role || !jobDesc) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Length caps to prevent API abuse
    if (company.length > 200) return new Response("Company name too long", { status: 400 });
    if (role.length > 200) return new Response("Role too long", { status: 400 });
    if (jobDesc.length > 10000) return new Response("Job description too long (max 10000 chars)", { status: 400 });

    const validatedTone: Tone = VALID_TONES.includes(tone) ? tone : "professional";

    const toneGuide: Record<Tone, string> = {
      professional: "formal, polished, and confident",
      enthusiastic: "energetic, passionate, and personable",
      concise: "brief, direct, and impact-focused — under 200 words",
    };

    const prompt = `Write a cover letter for the following application.

Company: ${company}
Role: ${role}
Job Description:
${jobDesc.slice(0, 3000)}

Tone: ${toneGuide[validatedTone]}

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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return new Response(message, { status: 500 });
  }
}
