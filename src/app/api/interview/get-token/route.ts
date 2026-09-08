import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/app/lib/supabase/server";
import { tokenRateLimit, getClientIp } from "@/app/lib/rateLimit";
import { retrieveForJD } from "@/app/lib/retrieval";

interface Analysis {
  job_description: string | null;
  ats_score: number | null;
  calculated_yoe: number | null;
  summary_feedback: string | null;
  skills_found: string[] | null;
  missing_keywords: string[] | null;
  formatting_issues: string[] | null;
}

/** The resume sections most relevant to this JD (hybrid search + rerank), so the
 *  interviewer probes the content that actually matters. Best-effort. */
async function relevantResumeSections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resumeId: string,
  jobDescription: string
): Promise<string> {
  if (!jobDescription.trim()) return "";
  try {
    const chunks = await retrieveForJD(supabase, {
      userId,
      resumeId,
      jd: jobDescription,
      topN: 4,
    });
    return chunks
      .map((c) => c.content.trim())
      .join("\n\n")
      .slice(0, 3000);
  } catch {
    return "";
  }
}

/** Compact, structured interviewer brief: what to probe and where the gaps are. */
function buildBrief(opts: {
  resumeText: string;
  relevantSections: string;
  analysis: Analysis | null;
}): string {
  const { resumeText, relevantSections, analysis } = opts;
  const jd = (analysis?.job_description ?? "").slice(0, 1500);
  const parts: string[] = [];

  if (analysis) {
    const snap: string[] = ["CANDIDATE SNAPSHOT (from the resume analysis for this exact role):"];
    if (analysis.ats_score != null) snap.push(`- Resume/JD match score: ${analysis.ats_score}/100`);
    if (analysis.calculated_yoe != null) snap.push(`- Years of experience: ${analysis.calculated_yoe}`);
    if (analysis.skills_found?.length)
      snap.push(`- Already-matched strengths (probe for depth, not existence): ${analysis.skills_found.slice(0, 12).join(", ")}`);
    if (analysis.missing_keywords?.length)
      snap.push(`- Gaps vs the JD (press hard on these): ${analysis.missing_keywords.slice(0, 10).join(", ")}`);
    if (analysis.summary_feedback) snap.push(`- Recruiter's take: ${analysis.summary_feedback.slice(0, 400)}`);
    parts.push(snap.join("\n"));
  }

  parts.push(
    relevantSections
      ? `MOST JD-RELEVANT RESUME SECTIONS:\n${relevantSections}`
      : `CANDIDATE RESUME:\n${resumeText.slice(0, 3500)}`
  );

  parts.push(`TARGET JOB DESCRIPTION:\n${jd || "Not provided - run a general interview for the stated role."}`);

  // Cap to keep the LiveKit token metadata well under signaling size limits.
  return parts.join("\n\n").slice(0, 6000);
}

// Must run in Node.js runtime - livekit-server-sdk depends on Node crypto
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ── 0. Rate limit by IP: max 3 token requests / 10 min ────────────────────
  if (tokenRateLimit) {
    const ip = getClientIp(req);
    const { success, limit, remaining, reset } = await tokenRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "Too many voice session requests. Please wait a few minutes and try again.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // ── 1. Verify authenticated session ──────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse and validate request body ───────────────────────────────────
  let resumeId: string | undefined;
  try {
    const body = await req.json();
    resumeId = typeof body?.resumeId === "string" ? body.resumeId : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  // ── 3. Fetch resume content + full analysis from Supabase ───────────────
  // The .eq("user_id") clause enforces ownership - no cross-user leakage.
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select(
      "content, analyses(job_description, ats_score, calculated_yoe, summary_feedback, skills_found, missing_keywords, formatting_issues)"
    )
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json(
      { error: "Resume not found or access denied" },
      { status: 404 }
    );
  }

  const analysis = ((resume.analyses as Analysis[] | null)?.[0] ?? null);
  const resumeText: string = resume.content ?? "";
  const jobDescription: string = analysis?.job_description ?? "";

  // ── 3b. Build the structured interviewer brief ─────────────────────────
  const relevantSections = await relevantResumeSections(
    supabase,
    user.id,
    resumeId,
    jobDescription
  );
  const brief = buildBrief({ resumeText, relevantSections, analysis });

  // ── 4. Verify LiveKit credentials are configured ──────────────────────────
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("[get-token] LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set");
    return NextResponse.json(
      { error: "Voice interview service is not configured" },
      { status: 503 }
    );
  }

  // ── 5. Build a unique room name for this session ──────────────────────────
  const roomName = `interview-${user.id}-${Date.now()}`;

  // ── 6. Inject the interviewer brief as participant metadata for the agent ─
  // Keep payload under safe JWT size limits. The agent reads this on join.
  const metadata = JSON.stringify({
    userId: user.id,
    brief,
  });

  // ── 7. Generate the signed AccessToken ───────────────────────────────────
  const token = new AccessToken(apiKey, apiSecret, {
    identity: `user-${user.id}`,
    ttl: "1h",
    metadata,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();

  return NextResponse.json({ token: jwt, roomName });
}
