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

    const prompt = `You are an expert career coach who writes cover letters that get callbacks. Write a compelling, personalized cover letter for this exact application.

Company: ${company}
Role: ${role}
Writing Tone: ${toneGuide[validatedTone]}

Job Description:
${jobDesc.slice(0, 3000)}

STRICT REQUIREMENTS:
1. Address it to "Dear Hiring Team" or "Dear ${company} Team" (no generic "To Whom It May Concern")
2. OPENING: Start with a punchy, specific hook that names the role AND ${company} — reference something specific about the company or role (not generic flattery)
3. PARAGRAPH 2: Connect 2-3 specific skills/experiences from the JD requirements to concrete achievements with numbers/results
4. PARAGRAPH 3: Show you understand the company's mission/product and how you specifically add value
5. CLOSING: Strong call to action, express genuine enthusiasm, sign off as "Sincerely, [Applicant]"
6. Length: 3-4 paragraphs, under 350 words
7. DO NOT use placeholder brackets like [Your Name] or [Your Phone] — write the letter completely, signed as "[Applicant]"
8. DO NOT add any meta-commentary, notes, or explanations — output ONLY the cover letter text itself
9. Make every sentence earn its place — cut fluff, focus on specific value

Output the cover letter now:`;

    const result = streamText({
      model: google("gemini-3.1-flash-lite-preview"),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return new Response(message, { status: 500 });
  }
}
