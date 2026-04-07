import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { role, jobDesc } = await req.json();
  if (!role || !jobDesc) return new Response("Missing fields", { status: 400 });

  const { object } = await generateObject({
    model: google("gemini-2.5-flash-preview-04-17"),
    schema: z.object({
      questions: z.array(z.object({
        question: z.string(),
        category: z.enum(["Behavioral", "Technical", "Situational", "Culture Fit"]),
      })).length(5),
    }),
    prompt: `Generate 5 interview questions for a ${role} role.

Job Description:
${jobDesc.slice(0, 2000)}

Requirements:
- Mix of behavioral (2), technical (2), and situational/culture fit (1) questions
- Each question should be specific to the role and JD, not generic
- Behavioral questions should use "Tell me about a time..." or "Describe a situation..."
- Technical questions should test skills mentioned in the JD
- Questions should be challenging but fair for the level implied by the JD`,
  });

  return Response.json(object);
}
