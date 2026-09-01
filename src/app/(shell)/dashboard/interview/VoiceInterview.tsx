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
import { Microphone as Mic, MicrophoneSlash as MicOff, PhoneDisconnect as PhoneOff, FileText, CaretDown as ChevronDown } from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/dashboard/aurora-background";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const EASE = [0.16, 1, 0.3, 1] as const;

interface Resume { id: string; file_name: string; created_at: string }
interface LiveSession { token: string; roomName: string }

const STATUS: Record<string, { label: string; dotColor: string; pulse: boolean }> = {
  disconnected:            { label: "Disconnected",      dotColor: "#b9bbc6", pulse: false },
  connecting:              { label: "Connecting…",       dotColor: "#12a594", pulse: true  },
  "pre-connect-buffering": { label: "Preparing…",        dotColor: "#12a594", pulse: true  },
  failed:                  { label: "Connection failed", dotColor: "#f43f5e", pulse: false },
  initializing:            { label: "Initializing…",     dotColor: "#12a594", pulse: true  },
  idle:                    { label: "Ready",             dotColor: "#b9bbc6", pulse: false },
  listening:               { label: "Listening",         dotColor: "#10b981", pulse: false },
  thinking:                { label: "Thinking…",         dotColor: "#f59e0b", pulse: true  },
  speaking:                { label: "Speaking",          dotColor: "#8b5cf6", pulse: true  },
};
function getStatus(s: string) { return STATUS[s] ?? STATUS.disconnected; }

// ── Orb ──────────────────────────────────────────────────────────────────────

function AgentOrb({ state }: { state: AgentState }) {
  const isSpeaking  = state === "speaking";
  const isThinking  = state === "thinking";
  const isListening = state === "listening";
  const isActive    = isSpeaking || isThinking || isListening;

  const ringRgb =
    isSpeaking  ? "139 92 246" :
    isThinking  ? "245 158 11" :
    isListening ? "16 185 129" :
                  "6 182 212";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="halo"
            className="absolute inset-0 rounded-full"
            style={{ background: `rgba(${ringRgb} / 0.07)` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0, 0.1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isSpeaking || isThinking) && (
          <motion.div
            key="midring"
            className="absolute rounded-full"
            style={{ inset: "14px", background: `rgba(${ringRgb} / 0.09)` }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.28, 1], opacity: [0.18, 0, 0.18] }}
            exit={{ opacity: 0 }}
            transition={{ duration: isSpeaking ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `rgba(${ringRgb} / 0.08)`,
          border: `1.5px solid rgba(${ringRgb} / 0.22)`,
          boxShadow: isActive ? `0 0 36px rgba(${ringRgb} / 0.18)` : "none",
        }}
        animate={
          isSpeaking ? { scale: [1, 1.07, 1] } :
          isThinking ? { scale: [1, 0.93, 1] } :
          { scale: 1 }
        }
        transition={{ duration: isSpeaking ? 0.7 : 1.8, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
      >
        <motion.div
          className="w-5 h-5 rounded-full"
          style={{ background: getStatus(state).dotColor }}
          animate={
            getStatus(state).pulse
              ? { opacity: [0.7, 1, 0.7], scale: [0.88, 1.12, 0.88] }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 1.4, repeat: getStatus(state).pulse ? Infinity : 0, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ state, connectionState }: { state: AgentState; connectionState: string }) {
  const effectiveState = connectionState === "connecting" && state === "disconnected" ? "connecting" : state;
  const cfg = getStatus(effectiveState);

  return (
    <motion.div
      key={effectiveState}
      initial={{ opacity: 0, y: 4, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border"
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.pulse && "animate-pulse")}
        style={{ background: cfg.dotColor }}
      />
      <span className="text-[11px] font-medium text-muted-foreground">
        {cfg.label}
      </span>
    </motion.div>
  );
}

// ── Transcript ────────────────────────────────────────────────────────────────

interface TranscriptSegment { id: string; text: string; final: boolean }

function TranscriptArea({ segments }: { segments: TranscriptSegment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [segments.length]);

  const finals = segments.filter(s => s.final && s.text.trim());
  if (finals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-h-40 overflow-y-auto rounded-xl p-4 space-y-2.5 scrollbar-none bg-muted/50 border border-border"
    >
      <p className="text-[9px] font-mono uppercase tracking-widest mb-2.5 text-muted-foreground/60">
        Transcript
      </p>
      <AnimatePresence initial={false}>
        {finals.map((seg) => (
          <motion.div
            key={seg.id}
            initial={{ opacity: 0, x: -8, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="flex gap-2.5"
          >
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">{seg.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </motion.div>
  );
}

// ── Active Session ─────────────────────────────────────────────────────────────

function ActiveSession({ onEnd }: { onEnd: () => void }) {
  const { state, agentTranscriptions } = useVoiceAssistant();
  const connectionState = useConnectionState() as string;
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  const toggleMic = useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("notallowed")) {
        toast.error("Microphone access denied - check your browser permissions and reload.");
      } else {
        toast.error("Could not toggle microphone.");
      }
    }
  }, [localParticipant, isMicrophoneEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex flex-col gap-4"
    >
      {/* Tiles */}
      <div className="flex gap-3 items-stretch">
        {/* AI Tile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex-1 relative rounded-2xl flex flex-col items-center justify-center gap-4 overflow-hidden bg-muted/30 border border-border"
          style={{ minHeight: 260 }}
        >
          <AuroraBackground className="opacity-50" />

          <div className="absolute top-4 left-4">
            <AnimatePresence mode="wait">
              <StatusPill key={state} state={state} connectionState={connectionState} />
            </AnimatePresence>
          </div>

          <div className="relative mt-4">
            <AgentOrb state={state} />
          </div>

          <div className="relative text-center pb-2">
            <p className="text-[13px] font-semibold text-foreground">Viva</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-0.5 text-muted-foreground">Interviewer</p>
          </div>
        </motion.div>

        {/* User Tile */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: EASE }}
          className="w-[108px] rounded-2xl flex flex-col items-center justify-center gap-3 py-6 bg-muted/50 border border-border"
        >
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: isMicrophoneEnabled ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)",
              border: `1.5px solid ${isMicrophoneEnabled ? "rgba(16,185,129,0.28)" : "rgba(244,63,94,0.28)"}`,
            }}
            animate={
              isMicrophoneEnabled
                ? { boxShadow: ["0 0 0 0 rgba(16,185,129,0)", "0 0 0 8px rgba(16,185,129,0.08)", "0 0 0 0 rgba(16,185,129,0)"] }
                : {}
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          >
            {isMicrophoneEnabled
              ? <Mic size={20} className="text-emerald-600" />
              : <MicOff size={20} className="text-rose-600" />
            }
          </motion.div>

          <div className="text-center">
            <p className="text-[12px] font-semibold text-foreground">You</p>
            <p className={`text-[10px] font-mono mt-0.5 ${isMicrophoneEnabled ? "text-emerald-600" : "text-rose-600"}`}>
              {isMicrophoneEnabled ? "Live" : "Muted"}
            </p>
          </div>
        </motion.div>
      </div>

      <TranscriptArea segments={agentTranscriptions} />

      <p className="text-center text-[11px] text-muted-foreground/60">
        Speak naturally - the AI handles turn-taking
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-1">
        <motion.button
          onClick={toggleMic}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          title={isMicrophoneEnabled ? "Mute" : "Unmute"}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors border",
            isMicrophoneEnabled ? "bg-muted border-border text-muted-foreground" : "bg-rose-500/10 border-rose-500/30 text-rose-600"
          )}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </motion.button>

        <motion.button
          onClick={onEnd}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="h-12 px-8 rounded-full flex items-center gap-2 text-sm font-semibold text-white bg-rose-600 shadow-lg shadow-rose-600/25"
        >
          <PhoneOff size={18} />
          End Interview
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Setup View ───────────────────────────────────────────────────────────────

function SetupView({
  resumes, resumesLoading, selectedId, onSelect, onStart, loading,
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Resume picker */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-2 text-muted-foreground">
          Select Resume
        </label>
        {resumesLoading ? (
          <div className="h-11 rounded-xl flex items-center px-4 gap-2 bg-muted/30 border border-border">
            <CoinLoader size={16} className="text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground/60">Loading resumes…</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="h-11 rounded-xl flex items-center px-4 bg-muted/30 border border-border">
            <span className="text-sm text-muted-foreground">
              No resumes found -{" "}
              <a href="/upload" className="underline text-primary">upload one first</a>
            </span>
          </div>
        ) : (
          <div className="relative">
            <FileText size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60" />
            <select
              value={selectedId}
              onChange={e => onSelect(e.target.value)}
              className={cn(
                "w-full h-11 pl-11 pr-9 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none transition-all bg-card border-[1.5px] border-border",
                selectedId ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <option value="" disabled>Choose a resume…</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.file_name.replace(/\.pdf$/i, "")}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60" />
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="rounded-xl p-4 space-y-3 bg-muted/30 border border-border">
        <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1 text-muted-foreground/60">
          Before you begin
        </p>
        {[
          "Allow microphone access when prompted",
          "Use headphones to prevent echo",
          "Speak at a natural pace - the AI handles turn-taking",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 border border-primary/15 text-primary">
              {i + 1}
            </span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>

      {!LIVEKIT_URL && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <span className="text-sm leading-none mt-0.5 text-amber-500">⚠</span>
          <p className="text-[12px] leading-relaxed text-amber-800">
            <span className="font-semibold">Not configured.</span>{" "}
            Add <code className="font-mono px-1 rounded text-[11px] bg-amber-500/10">NEXT_PUBLIC_LIVEKIT_URL</code> to
            your <code className="font-mono px-1 rounded text-[11px] bg-amber-500/10">.env.local</code> and restart.
          </p>
        </div>
      )}

      <motion.button
        onClick={onStart}
        disabled={!selectedId || loading || !LIVEKIT_URL}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-primary shadow-lg shadow-primary/25"
      >
        {loading
          ? <><CoinLoader size={18} className="text-current" />Connecting…</>
          : <><Mic size={18} />Start Voice Interview</>
        }
      </motion.button>
    </motion.div>
  );
}

// ── Ended View ────────────────────────────────────────────────────────────────

function EndedView({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-8 text-center"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
        <Mic size={24} className="text-emerald-600" />
      </div>
      <div>
        <p className="text-[15px] font-semibold mb-1 text-foreground">Session ended</p>
        <p className="text-sm text-muted-foreground">Your voice interview session has concluded.</p>
      </div>
      <motion.button
        onClick={onRestart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="h-10 px-6 rounded-xl text-sm font-semibold transition-colors text-white bg-primary shadow-md shadow-primary/20"
      >
        Start New Session
      </motion.button>
    </motion.div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

import React from "react";

function VoiceInterview({
  onActiveChange,
}: {
  onActiveChange?: (active: boolean) => void;
}) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onActiveChange?.(!!session && !sessionEnded);
  }, [session, sessionEnded, onActiveChange]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
      toast.error("Voice interview is not configured - add NEXT_PUBLIC_LIVEKIT_URL to your .env.local.");
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

  if (session) {
    if (!LIVEKIT_URL) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Voice interview not configured</p>
          <motion.button onClick={handleEnd} whileTap={{ scale: 0.97 }}
            className="h-9 px-5 rounded-xl text-xs font-semibold border border-border text-muted-foreground"
          >
            Back
          </motion.button>
        </div>
      );
    }
    return (
      <LiveKitRoom serverUrl={LIVEKIT_URL} token={session.token} connect audio video={false} onDisconnected={handleEnd} options={{ stopLocalTrackOnUnpublish: false }}>
        <RoomAudioRenderer />
        <ActiveSession onEnd={handleEnd} />
      </LiveKitRoom>
    );
  }

  if (sessionEnded) return <EndedView onRestart={() => setSessionEnded(false)} />;

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

export default React.memo(VoiceInterview);
