import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { role, jobDesc } = body;

    if (!role || !jobDesc) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Length caps to prevent API abuse
    if (role.length > 200) {
      return Response.json({ error: "Role too long (max 200 chars)" }, { status: 400 });
    }
    if (jobDesc.length > 10000) {
      return Response.json({ error: "Job description too long (max 10000 chars)" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite-preview"),
      schema: z.object({
        questions: z.array(z.object({
          question: z.string(),
          category: z.enum(["Behavioral", "Technical", "Situational", "Culture Fit"]),
        })).length(5),
      }),
      prompt: `You are a senior hiring manager conducting a real interview for a ${role} position. Generate 5 high-quality, specific interview questions.

Job Description:
${jobDesc.slice(0, 2000)}

REQUIREMENTS:
- 2 behavioral questions: Use "Tell me about a time..." or "Describe a situation where..." — focus on skills directly mentioned in the JD
- 2 technical questions: Test specific technologies/methodologies listed in the JD, not generic knowledge
- 1 situational or culture-fit question: Scenario-based or values alignment

QUALITY BARS:
- Questions must reference the SPECIFIC role level and responsibilities in the JD
- Technical questions should name actual tools/languages/frameworks from the JD
- Behavioral questions should target competencies that are explicitly or implicitly required
- NO generic questions like "Tell me about yourself" or "Where do you see yourself in 5 years"
- Each question should be something a candidate would actually struggle with if underprepared`,
    });

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate questions";
    return Response.json({ error: message }, { status: 500 });
  }
}
