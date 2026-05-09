import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/app/lib/supabase/server";

// Must run in Node.js runtime — livekit-server-sdk depends on Node crypto
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

  // ── 3. Fetch resume content + job description from Supabase ──────────────
  // The .eq("user_id") clause enforces ownership — no cross-user leakage.
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("content, analyses(job_description)")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json(
      { error: "Resume not found or access denied" },
      { status: 404 }
    );
  }

  const analyses = resume.analyses as { job_description: string }[] | null;
  const resumeText: string = resume.content ?? "";
  const jobDescription: string = analyses?.[0]?.job_description ?? "";

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

  // ── 6. Inject resume + JD as participant metadata for the Python agent ────
  // Keep payload under safe JWT size limits. The agent reads this on join.
  const metadata = JSON.stringify({
    userId: user.id,
    resumeText: resumeText.slice(0, 4_000),
    jobDescription: jobDescription.slice(0, 1_500),
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
