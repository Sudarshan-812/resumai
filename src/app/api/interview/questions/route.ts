import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/app/lib/supabase/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function cacheKey(role: string, jobDesc: string) {
  // Deterministic 80-char key from first 200 chars of each input
  const raw = `${role.slice(0, 100)}::${jobDesc.slice(0, 200)}`;
  return `interview:q:${Buffer.from(raw).toString("base64url").slice(0, 80)}`;
}
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    // Gate: check monthly interview limit before doing anything expensive
    const { data: limitStatus } = await supabase.rpc("check_interview_limit", {
      p_user_id: user.id,
    });
    if (limitStatus === "limit_reached") {
      return Response.json(
        { error: "interview_limit_reached", message: "You've used all 3 free interviews this month. Upgrade to continue." },
        { status: 402 }
      );
    }

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

    // Cache hit — return without generating or incrementing the counter
    const key = cacheKey(role, jobDesc);
    const cached = await redis.get(key).catch(() => null);
    if (cached) return Response.json(cached);

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
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

    // Increment counter and cache only after successful generation
    await supabase.rpc("increment_interview_count", { p_user_id: user.id });
    await redis.setex(key, 60 * 60 * 24, object).catch(() => {});

    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate questions";
    return Response.json({ error: message }, { status: 500 });
  }
}
