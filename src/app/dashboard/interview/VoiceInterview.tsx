"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import type { AgentState } from "@livekit/components-react";
import {
  Mic, MicOff, PhoneOff, Loader2,
  FileText, ChevronDown, Radio,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Resolved once at module load — undefined when env var is not set in .env.local
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resume {
  id: string;
  file_name: string;
  created_at: string;
}

interface LiveSession {
  token: string;
  roomName: string;
}

// ── Status config keyed on AgentState string literals ─────────────────────────

const STATUS: Record<
  string,
  { label: string; dotColor: string; ringColor: string; textColor: string; pulse: boolean }
> = {
  disconnected:           { label: "Disconnected",        dotColor: "bg-zinc-500",    ringColor: "bg-zinc-500",    textColor: "text-zinc-400",    pulse: false },
  connecting:             { label: "Connecting…",          dotColor: "bg-cyan-500",    ringColor: "bg-cyan-400",    textColor: "text-cyan-600",    pulse: true  },
  "pre-connect-buffering":{ label: "Preparing…",           dotColor: "bg-cyan-500",    ringColor: "bg-cyan-400",    textColor: "text-cyan-600",    pulse: true  },
  failed:                 { label: "Connection failed",    dotColor: "bg-rose-500",    ringColor: "bg-rose-400",    textColor: "text-rose-400",    pulse: false },
  initializing:           { label: "Initializing…",        dotColor: "bg-cyan-500",    ringColor: "bg-cyan-400",    textColor: "text-cyan-600",    pulse: true  },
  idle:                   { label: "Ready",                dotColor: "bg-zinc-400",    ringColor: "bg-zinc-400",    textColor: "text-zinc-400",    pulse: false },
  listening:              { label: "Listening",            dotColor: "bg-emerald-500", ringColor: "bg-emerald-400", textColor: "text-emerald-400", pulse: false },
  thinking:               { label: "Thinking…",            dotColor: "bg-amber-500",   ringColor: "bg-amber-400",   textColor: "text-amber-400",   pulse: true  },
  speaking:               { label: "Speaking",             dotColor: "bg-violet-500",  ringColor: "bg-violet-400",  textColor: "text-violet-400",  pulse: true  },
};

function getStatus(state: string) {
  return STATUS[state] ?? STATUS.disconnected;
}

// ── Animated orb ─────────────────────────────────────────────────────────────

function AgentOrb({ state }: { state: AgentState }) {
  const cfg = getStatus(state);

  const isSpeaking  = state === "speaking";
  const isThinking  = state === "thinking";
  const isListening = state === "listening";
  const isActive    = isSpeaking || isThinking || isListening;

  // Outer ring colour as a hex-ish tailwind bg for inline style
  const ringRgb =
    isSpeaking  ? "139 92 246" :  // violet-500
    isThinking  ? "245 158 11" :  // amber-500
    isListening ? "16 185 129" :  // emerald-500
                  "6 182 212";    // cyan-500

  return (
    <div className="relative flex items-center justify-center w-44 h-44">
      {/* Slow outer halo — always present when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="halo"
            className="absolute inset-0 rounded-full"
            style={{ background: `rgba(${ringRgb} / 0.08)` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.12, 0, 0.12] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Mid ring — speaking / thinking */}
      <AnimatePresence>
        {(isSpeaking || isThinking) && (
          <motion.div
            key="midring"
            className="absolute rounded-full"
            style={{
              inset: "12px",
              background: `rgba(${ringRgb} / 0.1)`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isSpeaking ? 1.2 : 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.25,
            }}
          />
        )}
      </AnimatePresence>

      {/* Core orb */}
      <motion.div
        className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center border",
          "shadow-lg transition-colors duration-500"
        )}
        style={{
          background: `rgba(${ringRgb} / 0.12)`,
          borderColor: `rgba(${ringRgb} / 0.3)`,
          boxShadow: isActive ? `0 0 32px rgba(${ringRgb} / 0.25)` : "none",
        }}
        animate={
          isSpeaking
            ? { scale: [1, 1.06, 1] }
            : isThinking
            ? { scale: [1, 0.94, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: isSpeaking ? 0.7 : 1.8,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Inner dot */}
        <motion.div
          className={cn("w-8 h-8 rounded-full", cfg.dotColor)}
          animate={
            cfg.pulse
              ? { opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 1.4, repeat: cfg.pulse ? Infinity : 0, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ── Status pill ────────────────────────────────────────────────────────────────

function StatusPill({ state, connectionState }: { state: AgentState; connectionState: string }) {
  const isRoomConnecting = connectionState === "connecting";
  const effectiveState = isRoomConnecting && state === "disconnected" ? "connecting" : state;
  const cfg = getStatus(effectiveState);

  return (
    <motion.div
      key={effectiveState}
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          cfg.dotColor,
          cfg.pulse && "animate-pulse"
        )}
      />
      <span className={cn("text-[12px] font-semibold", cfg.textColor)}>
        {cfg.label}
      </span>
    </motion.div>
  );
}

// ── Transcript area ───────────────────────────────────────────────────────────

interface TranscriptSegment {
  id: string;
  text: string;
  final: boolean;
}

function TranscriptArea({ segments }: { segments: TranscriptSegment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments.length]);

  const finalSegments = segments.filter((s) => s.final && s.text.trim());

  if (finalSegments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-h-52 overflow-y-auto rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 space-y-2 scrollbar-none"
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
        Transcript
      </p>
      <AnimatePresence initial={false}>
        {finalSegments.map((seg) => (
          <motion.div
            key={seg.id}
            initial={{ opacity: 0, x: -8, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="flex gap-2.5"
          >
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
            <p className="text-[13px] text-foreground leading-relaxed">{seg.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </motion.div>
  );
}

// ── Active session (must live inside <LiveKitRoom>) ───────────────────────────

function ActiveSession({
  onEnd,
  roomName,
}: {
  onEnd: () => void;
  roomName: string;
}) {
  const { state, agentTranscriptions } = useVoiceAssistant();
  const connectionState = useConnectionState() as string;
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-6">
      {/* Orb + status */}
      <div className="flex flex-col items-center gap-5">
        <AgentOrb state={state} />
        <AnimatePresence mode="wait">
          <StatusPill key={state} state={state} connectionState={connectionState} />
        </AnimatePresence>
        <p className="text-[10px] font-mono text-muted-foreground/40">{roomName}</p>
      </div>

      {/* Transcript */}
      <TranscriptArea segments={agentTranscriptions} />

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Mic toggle */}
        <motion.button
          onClick={toggleMic}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          className={cn(
            "w-12 h-12 rounded-full border flex items-center justify-center transition-colors",
            isMicrophoneEnabled
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
          )}
        >
          {isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} />}
        </motion.button>

        {/* End session */}
        <motion.button
          onClick={onEnd}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          title="End session"
          className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 transition-colors"
        >
          <PhoneOff size={18} />
        </motion.button>
      </div>

      <p className="text-[11px] text-muted-foreground/50">
        Speak naturally — the AI agent will respond in real time.
      </p>
    </div>
  );
}

// ── Setup view ────────────────────────────────────────────────────────────────

function SetupView({
  resumes,
  resumesLoading,
  selectedId,
  onSelect,
  onStart,
  loading,
}: {
  resumes: Resume[];
  resumesLoading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header card */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
          <Radio size={16} className="text-violet-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-1">Voice AI Interview</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            A real-time AI interviewer trained on your resume and target JD. Speak your answers
            naturally — no typing required.
          </p>
        </div>
      </div>

      {/* Resume picker */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
          Select resume
        </label>
        {resumesLoading ? (
          <div className="h-10 rounded-xl border border-border bg-card flex items-center px-3.5 gap-2">
            <Loader2 size={13} className="animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading resumes…</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="h-10 rounded-xl border border-border bg-card flex items-center px-3.5">
            <span className="text-sm text-muted-foreground">
              No resumes found —{" "}
              <a href="/upload" className="text-cyan-600 hover:underline">upload one first</a>
            </span>
          </div>
        ) : (
          <div className="relative">
            <FileText
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className={cn(
                "w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-card text-sm",
                "text-foreground appearance-none cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50",
                "transition-all"
              )}
            >
              <option value="" disabled>Choose a resume…</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name.replace(/\.pdf$/i, "")}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Before you begin
        </p>
        {[
          "Allow microphone access when the browser prompts",
          "Use headphones to prevent echo",
          "Speak at a natural pace — the AI handles turn-taking",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {/* Not-configured warning */}
      {!LIVEKIT_URL && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-amber-400 text-sm leading-none mt-0.5">⚠</span>
          <p className="text-[12px] text-amber-600 leading-relaxed">
            <span className="font-semibold">Not configured.</span>{" "}
            Add <code className="font-mono bg-amber-500/10 px-1 rounded text-[11px]">NEXT_PUBLIC_LIVEKIT_URL</code> to
            your <code className="font-mono bg-amber-500/10 px-1 rounded text-[11px]">.env.local</code> and restart the dev server.
          </p>
        </div>
      )}

      {/* Start button */}
      <motion.button
        onClick={onStart}
        disabled={!selectedId || loading || !LIVEKIT_URL}
        whileHover={selectedId && !loading && !!LIVEKIT_URL ? { y: -1 } : {}}
        whileTap={selectedId && !loading && !!LIVEKIT_URL ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
          "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/20",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        )}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" />Connecting…</>
        ) : (
          <><Mic size={14} />Start Voice Interview</>
        )}
      </motion.button>
    </motion.div>
  );
}

// ── Ended view ────────────────────────────────────────────────────────────────

function EndedView({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-10 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <Radio size={20} className="text-emerald-500" />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">Session ended</h3>
        <p className="text-sm text-muted-foreground">Your voice interview session has concluded.</p>
      </div>
      <motion.button
        onClick={onRestart}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors shadow-md shadow-violet-500/20"
      >
        Start New Session
      </motion.button>
    </motion.div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function VoiceInterview() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user's resumes on mount via browser Supabase client
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("resumes")
          .select("id, file_name, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) setResumes(data);
      } finally {
        setResumesLoading(false);
      }
    })();
  }, []);

  const handleStart = async () => {
    if (!selectedId) return;
    if (!LIVEKIT_URL) {
      toast.error("Voice interview is not configured — add NEXT_PUBLIC_LIVEKIT_URL to your .env.local file.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedId }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error ?? `Server error ${res.status}`);
      }

      const { token, roomName } = await res.json() as { token: string; roomName: string };
      setSession({ token, roomName });
      setSessionEnded(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start voice session");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = useCallback(() => {
    setSession(null);
    setSessionEnded(true);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────
  if (session) {
    // LIVEKIT_URL is guaranteed non-empty here — handleStart guards against it.
    // The explicit check below is a safety net for future code paths.
    if (!LIVEKIT_URL) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-12 text-center"
        >
          <p className="text-sm font-semibold text-foreground">Voice interview not configured</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_LIVEKIT_URL</code> to
            your <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">.env.local</code> file and
            restart the dev server.
          </p>
          <motion.button
            onClick={handleEnd}
            whileTap={{ scale: 0.97 }}
            className="mt-2 h-9 px-5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </motion.button>
        </motion.div>
      );
    }

    return (
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={session.token}
        connect
        audio
        video={false}
        onDisconnected={handleEnd}
      >
        {/* Renders remote audio tracks to the page */}
        <RoomAudioRenderer />
        <ActiveSession onEnd={handleEnd} roomName={session.roomName} />
      </LiveKitRoom>
    );
  }

  if (sessionEnded) {
    return <EndedView onRestart={() => setSessionEnded(false)} />;
  }

  return (
    <SetupView
      resumes={resumes}
      resumesLoading={resumesLoading}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onStart={handleStart}
      loading={loading}
    />
  );
}
