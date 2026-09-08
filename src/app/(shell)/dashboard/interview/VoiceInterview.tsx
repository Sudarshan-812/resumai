"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useConnectionState,
  useLocalParticipant,
  useTranscriptions,
  useTrackVolume,
} from "@livekit/components-react";
import type { AgentState } from "@livekit/components-react";
import {
  Microphone as Mic, MicrophoneSlash as MicOff, PhoneDisconnect as PhoneOff,
  FileText, CaretDown as ChevronDown, CheckCircle, WarningCircle,
} from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/dashboard/aurora-background";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const EASE = [0.16, 1, 0.3, 1] as const;

interface Resume { id: string; file_name: string; created_at: string; job_description: string | null }
interface LiveSession { token: string; roomName: string; resumeId: string }
interface Summary { score: number; summary: string; strengths: string[]; improvements: string[]; highlight: string }

const scoreColor = (s: number) => (s >= 70 ? "#059669" : s >= 50 ? "#d97706" : "#e11d48");

// ── Status styling (brand palette) ───────────────────────────────────────────

const C = { teal: "18,165,148", deep: "0,133,115", slate: "128,131,141", grey: "185,187,198", red: "229,72,77" };
function S(rgb: string, label: string, pulse: boolean) {
  return {
    label, pulse,
    dot: `rgb(${rgb})`,
    fill: `rgba(${rgb},0.08)`,
    border: `rgba(${rgb},0.24)`,
    glow: `rgba(${rgb},0.20)`,
    ring: `rgba(${rgb},0.10)`,
  };
}
const STATUS: Record<string, ReturnType<typeof S>> = {
  disconnected:            S(C.grey,  "Not connected",     false),
  connecting:              S(C.teal,  "Connecting…",       true),
  "pre-connect-buffering": S(C.teal,  "Preparing…",        true),
  initializing:            S(C.teal,  "Getting ready…",    true),
  idle:                    S(C.grey,  "Ready",             false),
  listening:               S(C.teal,  "Listening",         false),
  thinking:                S(C.slate, "Thinking…",         true),
  speaking:                S(C.deep,  "Viva is speaking",  true),
  failed:                  S(C.red,   "Connection failed", false),
};
const getStatus = (s: string) => STATUS[s] ?? STATUS.disconnected;

function fmtClock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Orb ──────────────────────────────────────────────────────────────────────

function AgentOrb({ state, volume, reduced }: { state: AgentState; volume: number; reduced: boolean }) {
  const cfg = getStatus(state);
  const active = state === "listening" || state === "thinking" || state === "speaking";
  const scale = active ? 1 + Math.min(volume * 0.5, 0.26) : 1;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {active && !reduced && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: cfg.ring }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.14, 0, 0.14] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: cfg.fill,
          border: `1.5px solid ${cfg.border}`,
          boxShadow: active ? `0 0 32px ${cfg.glow}` : "none",
        }}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <motion.div
          className="w-4 h-4 rounded-full"
          style={{ background: cfg.dot }}
          animate={cfg.pulse && !reduced ? { opacity: [0.65, 1, 0.65] } : { opacity: 1 }}
          transition={{ duration: 1.4, repeat: cfg.pulse && !reduced ? Infinity : 0, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ── Transcript ───────────────────────────────────────────────────────────────

interface Line { speaker: "agent" | "user"; text: string }

function Transcript({ lines }: { lines: Line[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastText = lines[lines.length - 1]?.text ?? "";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [lines.length, lastText]);

  if (lines.length === 0) {
    return (
      <p className="text-center text-[11px] text-muted-foreground/60 py-4">
        The transcript appears here as you both speak.
      </p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="w-full max-h-64 overflow-y-auto rounded-xl p-4 space-y-3 bg-muted/40 border border-border"
    >
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">Transcript</p>
      {lines.map((l, i) => (
        <div key={i} className="flex gap-2.5">
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider shrink-0 w-14 pt-0.5",
              l.speaker === "user" ? "text-emerald-600" : "text-primary"
            )}
          >
            {l.speaker === "user" ? "You" : "Viva"}
          </span>
          <p className="text-[13px] leading-relaxed text-foreground/90">{l.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Active session ───────────────────────────────────────────────────────────

function ActiveSession({
  onEnd,
  onTranscriptChange,
}: {
  onEnd: () => void;
  onTranscriptChange: (transcript: string) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  const connectionState = useConnectionState() as string;
  const volume = useTrackVolume(audioTrack);
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const reduced = !!useReducedMotion();

  const [secs, setSecs] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (connectionState !== "connected") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [connectionState]);

  const lines = useMemo<Line[]>(
    () =>
      transcriptions
        .map((t) => ({
          speaker: t.participantInfo?.identity?.startsWith("user-") ? ("user" as const) : ("agent" as const),
          text: (t.text ?? "").trim(),
        }))
        .filter((l) => l.text),
    [transcriptions]
  );

  useEffect(() => {
    onTranscriptChange(
      lines.map((l) => `${l.speaker === "user" ? "Candidate" : "Interviewer"}: ${l.text}`).join("\n")
    );
  }, [lines, onTranscriptChange]);

  const cfg = getStatus(state);
  const effective = connectionState === "connecting" && state === "disconnected" ? "connecting" : state;
  const statusLabel = getStatus(effective).label;

  const toggleMic = useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      toast.error(
        msg.includes("permission") || msg.includes("denied") || msg.includes("notallowed")
          ? "Microphone access was blocked — check your browser's site permissions and reload."
          : "Could not toggle the microphone."
      );
    }
  }, [localParticipant, isMicrophoneEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex flex-col gap-4"
    >
      {/* Session bar — honest label, timer starts at connect */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
        <span className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Interview in progress
        </span>
        <span className="text-[12px] font-mono tabular-nums text-muted-foreground">
          {connectionState === "connected" ? fmtClock(secs) : "—:—"}
        </span>
      </div>

      {/* Tiles */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Viva */}
        <div className="flex-1 relative rounded-2xl flex flex-col items-center justify-center gap-4 overflow-hidden bg-muted/30 border border-border py-6" style={{ minHeight: 260 }}>
          {!reduced && <AuroraBackground className="opacity-40" />}

          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
              <span
                className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.pulse && !reduced && "animate-pulse")}
                style={{ background: cfg.dot }}
              />
              <span className="text-[11px] font-medium text-muted-foreground">{statusLabel}</span>
            </span>
          </div>

          <div className="relative mt-4">
            <AgentOrb state={state} volume={volume} reduced={reduced} />
          </div>

          <div className="relative text-center">
            <p className="text-[13px] font-semibold text-foreground">Viva</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-0.5 text-muted-foreground">Interviewer</p>
          </div>

          {/* SR-only live announcement */}
          <p className="sr-only" aria-live="polite">{statusLabel}</p>
        </div>

        {/* You */}
        <div className="sm:w-[132px] rounded-2xl flex sm:flex-col items-center justify-center gap-3 py-5 px-4 bg-muted/50 border border-border">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: isMicrophoneEnabled ? "rgba(16,185,129,0.08)" : "rgba(229,72,77,0.08)",
              border: `1.5px solid ${isMicrophoneEnabled ? "rgba(16,185,129,0.28)" : "rgba(229,72,77,0.28)"}`,
            }}
          >
            {isMicrophoneEnabled ? <Mic size={20} className="text-emerald-600" /> : <MicOff size={20} className="text-rose-600" />}
          </div>
          <div className="text-center">
            <p className="text-[12px] font-semibold text-foreground">You</p>
            <p className={cn("text-[10px] font-mono mt-0.5", isMicrophoneEnabled ? "text-emerald-600" : "text-rose-600")}>
              {isMicrophoneEnabled ? "Mic on" : "Muted"}
            </p>
          </div>
        </div>
      </div>

      <Transcript lines={lines} />

      <p className="text-center text-[11px] text-muted-foreground/60">
        Speak naturally — Viva handles turn-taking. End anytime to get your summary.
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-1">
        <button
          onClick={toggleMic}
          title={isMicrophoneEnabled ? "Mute" : "Unmute"}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors border",
            isMicrophoneEnabled ? "bg-muted border-border text-muted-foreground" : "bg-rose-500/10 border-rose-500/30 text-rose-600"
          )}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">End &amp; get your summary?</span>
            <button
              onClick={onEnd}
              className="h-10 px-4 rounded-full text-[13px] font-semibold text-white bg-rose-600"
            >
              End
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="h-10 px-4 rounded-full text-[13px] font-medium border border-border text-muted-foreground"
            >
              Keep going
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="h-12 px-7 rounded-full flex items-center gap-2 text-sm font-semibold text-white bg-rose-600"
          >
            <PhoneOff size={18} />
            End interview
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Mic pre-flight ───────────────────────────────────────────────────────────

type MicState = "idle" | "checking" | "ok" | "denied" | "error";

function useMicCheck() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  const check = useCallback(async () => {
    setMicState("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setMicState("ok");
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : "";
      setMicState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { micState, level, check, stop };
}

// ── Setup ────────────────────────────────────────────────────────────────────

function SetupView({
  resumes, resumesLoading, selectedId, onSelect, onStart, loading,
}: {
  resumes: Resume[];
  resumesLoading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onStart: (releaseMic: () => void) => void;
  loading: boolean;
}) {
  const { micState, level, check, stop } = useMicCheck();
  const [consent, setConsent] = useState(false);

  const selected = resumes.find((r) => r.id === selectedId);
  const jdLabel = selected?.job_description
    ?.split("\n")
    .map((s) => s.trim())
    .find(Boolean)
    ?.slice(0, 90);

  const canStart = !!selectedId && micState === "ok" && consent && !!LIVEKIT_URL && !loading;

  if (!LIVEKIT_URL) return <Unavailable />;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Resume picker */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-2 text-muted-foreground">
          Step 1 — Choose a resume
        </label>
        {resumesLoading ? (
          <div className="h-11 rounded-xl flex items-center px-4 gap-2 bg-muted/30 border border-border">
            <CoinLoader size={16} className="text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground/60">Loading resumes…</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="h-11 rounded-xl flex items-center px-4 bg-muted/30 border border-border">
            <span className="text-sm text-muted-foreground">
              No resumes yet —{" "}
              <a href="/upload" className="underline text-primary">upload one first</a>
            </span>
          </div>
        ) : (
          <div className="relative">
            <FileText size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60" />
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className={cn(
                "w-full h-11 pl-11 pr-9 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all bg-card border-[1.5px] border-border",
                selectedId ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <option value="" disabled>Choose a resume…</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.file_name.replace(/\.pdf$/i, "")}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60" />
          </div>
        )}

        {/* What the interview will target */}
        {selected && (
          jdLabel ? (
            <p className="mt-2 text-[12px] text-muted-foreground">
              Targets the job from your last analysis:{" "}
              <span className="text-foreground font-medium">“{jdLabel}…”</span>
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-[12px] text-amber-700">
              <WarningCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
              No job description is saved for this resume, so questions will be general.{" "}
              <a href="/upload" className="underline">Analyze it against a job</a> for a tailored interview.
            </p>
          )
        )}
      </div>

      {/* Mic check */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2 text-muted-foreground">
          Step 2 — Check your microphone
        </p>
        {micState === "ok" ? (
          <div className="rounded-xl p-3.5 bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-700">
              <CheckCircle size={16} weight="fill" /> Microphone is working
            </p>
            <div className="h-1.5 rounded-full bg-emerald-500/15 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-[width] duration-100" style={{ width: `${Math.round(level * 100)}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Say something — the bar should move.</p>
          </div>
        ) : micState === "denied" ? (
          <div className="rounded-xl p-3.5 bg-rose-500/5 border border-rose-500/20 text-[12px] leading-relaxed text-rose-700">
            Microphone access is blocked. Click the padlock in your browser&apos;s address bar, allow the microphone for this site, then{" "}
            <button onClick={check} className="underline font-semibold">try again</button>.
          </div>
        ) : micState === "error" ? (
          <div className="rounded-xl p-3.5 bg-amber-500/5 border border-amber-500/20 text-[12px] text-amber-800">
            Couldn&apos;t reach a microphone. Plug one in or check your system settings, then{" "}
            <button onClick={check} className="underline font-semibold">try again</button>.
          </div>
        ) : (
          <button
            onClick={check}
            disabled={micState === "checking"}
            className="w-full h-11 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 border border-border bg-card text-foreground disabled:opacity-50"
          >
            {micState === "checking"
              ? <><CoinLoader size={16} className="text-current" />Requesting access…</>
              : <><Mic size={16} />Check microphone</>}
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl p-4 space-y-2.5 bg-muted/30 border border-border">
        <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">Good to know</p>
        {[
          "Use headphones so Viva doesn't hear itself.",
          "Plan on 5–10 minutes and about 5–8 questions.",
          "You can mute, or end early, at any point.",
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">{i + 1}</span>
            <p className="text-[12px] leading-relaxed text-muted-foreground">{t}</p>
          </div>
        ))}
      </div>

      {/* Consent */}
      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          I understand my microphone audio is streamed to Viva&apos;s speech and language
          providers to run the interview in real time. It isn&apos;t stored after the session;
          only the text transcript is used to generate your summary.
        </span>
      </label>

      <button
        onClick={() => onStart(stop)}
        disabled={!canStart}
        className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-primary shadow-lg shadow-primary/25"
      >
        {loading
          ? <><CoinLoader size={18} className="text-current" />Connecting…</>
          : <><Mic size={18} />Start voice interview</>}
      </button>
    </motion.div>
  );
}

// ── Unavailable ──────────────────────────────────────────────────────────────

function Unavailable({ onBack }: { onBack?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <WarningCircle size={30} className="text-amber-500" />
      <p className="text-sm font-semibold text-foreground">Voice interview is temporarily unavailable</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Our real-time voice service isn&apos;t responding right now. Please try again shortly — text practice below works as usual.
      </p>
      {onBack && (
        <button onClick={onBack} className="mt-1 h-9 px-5 rounded-xl text-xs font-semibold border border-border text-muted-foreground">
          Back
        </button>
      )}
    </div>
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────

function SummaryView({
  loading, summary, error, lost, transcript, onRetry, onRestart,
}: {
  loading: boolean;
  summary: Summary | null;
  error: boolean;
  lost: boolean;
  transcript: string;
  onRetry: () => void;
  onRestart: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <CoinLoader size={26} />
        <p className="text-sm font-medium text-muted-foreground">Reviewing your interview…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
      {lost && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[12px] text-amber-800">
          <WarningCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
          Your connection dropped, so we wrapped the interview up here.
        </div>
      )}

      {error ? (
        <div className="space-y-4 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">Couldn&apos;t generate your summary</p>
          <p className="text-[13px] text-muted-foreground">Your transcript is saved below. You can retry the summary.</p>
          <button onClick={onRetry} className="h-10 px-6 rounded-xl text-[13px] font-semibold text-white bg-primary">
            Retry summary
          </button>
        </div>
      ) : !summary ? (
        <div className="py-6 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Interview ended</p>
          <p className="text-[13px] text-muted-foreground">There wasn&apos;t enough spoken to score this one.</p>
        </div>
      ) : (
        <>
          {/* Score */}
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">Interview score</p>
            <div className="flex items-baseline gap-2">
              <span className="font-black leading-none" style={{ fontSize: 56, fontFamily: "monospace", letterSpacing: "-0.04em", color: scoreColor(summary.score) }}>
                {summary.score}
              </span>
              <span className="text-[14px] font-semibold pb-1 text-muted-foreground/60">/100</span>
            </div>
            <div className="mt-3 h-[2px] rounded-full overflow-hidden bg-border">
              <div className="h-full rounded-full" style={{ width: `${summary.score}%`, background: scoreColor(summary.score) }} />
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-foreground/90">{summary.summary}</p>

          {summary.strengths.length > 0 && (
            <div>
              <div className="h-px bg-border mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-3 text-emerald-600">What worked</p>
              <ul className="space-y-2.5">
                {summary.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-foreground/90">
                    <CheckCircle size={15} className="text-emerald-600 mt-0.5 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.improvements.length > 0 && (
            <div>
              <div className="h-px bg-border mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-3 text-amber-600">To work on</p>
              <ul className="space-y-2.5">
                {summary.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-foreground/90">
                    <WarningCircle size={15} className="text-amber-600 mt-0.5 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.highlight && (
            <div>
              <div className="h-px bg-border mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2 text-primary">Re-practice this</p>
              <p className="text-[13.5px] leading-relaxed pl-4 border-l-[3px] border-primary/35 text-foreground/90">
                {summary.highlight}
              </p>
            </div>
          )}
        </>
      )}

      {transcript.trim() && (
        <details className="rounded-xl bg-muted/30 border border-border">
          <summary className="cursor-pointer px-4 py-3 text-[12px] font-semibold text-muted-foreground select-none">
            Full transcript
          </summary>
          <div className="px-4 pb-4 space-y-2 max-h-72 overflow-y-auto">
            {transcript.split("\n").filter(Boolean).map((line, i) => {
              const isCand = /^candidate:/i.test(line);
              return (
                <p key={i} className="text-[12.5px] leading-relaxed">
                  <span className={cn("font-mono text-[10px] uppercase tracking-wider mr-2", isCand ? "text-emerald-600" : "text-primary")}>
                    {isCand ? "You" : "Viva"}
                  </span>
                  <span className="text-foreground/85">{line.replace(/^(candidate|interviewer):\s*/i, "")}</span>
                </p>
              );
            })}
          </div>
        </details>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onRestart}
          className="flex-1 h-11 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 border border-border text-muted-foreground bg-card"
        >
          New interview
        </button>
        <button
          onClick={() => { window.location.href = "/dashboard"; }}
          className="flex-1 h-11 rounded-xl text-[12px] font-bold text-white flex items-center justify-center bg-primary shadow-md shadow-primary/20"
        >
          Back to dashboard
        </button>
      </div>
    </motion.div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

type Phase = "setup" | "live" | "summarizing" | "summary";

function VoiceInterview({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [lost, setLost] = useState(false);

  const endedByUser = useRef(false);
  const finishing = useRef(false);
  const transcriptRef = useRef("");
  const resumeIdRef = useRef("");

  useEffect(() => {
    onActiveChange?.(phase === "live");
  }, [phase, onActiveChange]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("resumes")
          .select("id, file_name, created_at, analyses(job_description)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) {
          setResumes(
            data.map((r) => ({
              id: r.id as string,
              file_name: r.file_name as string,
              created_at: r.created_at as string,
              job_description:
                (r.analyses as { job_description: string }[] | null)?.[0]?.job_description ?? null,
            }))
          );
        }
      } finally {
        setResumesLoading(false);
      }
    })();
  }, []);

  const runSummary = useCallback(async () => {
    const rid = resumeIdRef.current;
    const transcript = transcriptRef.current;
    setPhase("summarizing");
    if (!rid || !transcript.trim()) {
      setSummary(null);
      setSummaryError(false);
      setPhase("summary");
      return;
    }
    try {
      const res = await fetch("/api/interview/voice-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: rid, transcript }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Summary;
      setSummary(data);
      setSummaryError(false);
      try { localStorage.setItem("viva_last_voice_summary", JSON.stringify({ ...data, at: Date.now() })); } catch {}
    } catch {
      setSummary(null);
      setSummaryError(true);
    } finally {
      setPhase("summary");
    }
  }, []);

  const finish = useCallback(
    (reason: "user" | "lost") => {
      if (finishing.current) return;
      finishing.current = true;
      setLost(reason === "lost");
      setSession(null);
      void runSummary();
    },
    [runSummary]
  );

  const handleStart = async (releaseMic: () => void) => {
    if (!selectedId || !LIVEKIT_URL) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedId }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.message ?? payload.error ?? `Server error ${res.status}`);
      }
      const { token, roomName } = (await res.json()) as { token: string; roomName: string };
      releaseMic(); // free the pre-flight mic so LiveKit can claim it
      endedByUser.current = false;
      finishing.current = false;
      transcriptRef.current = "";
      resumeIdRef.current = selectedId;
      setSummary(null);
      setSummaryError(false);
      setLost(false);
      setSession({ token, roomName, resumeId: selectedId });
      setPhase("live");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't start the voice interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndByUser = useCallback(() => {
    endedByUser.current = true;
    finish("user");
  }, [finish]);

  const handleDisconnected = useCallback(() => {
    if (endedByUser.current) return; // already handled
    finish("lost");
  }, [finish]);

  const reset = useCallback(() => {
    finishing.current = false;
    endedByUser.current = false;
    transcriptRef.current = "";
    setSummary(null);
    setSummaryError(false);
    setLost(false);
    setPhase("setup");
  }, []);

  if (phase === "summarizing" || phase === "summary") {
    return (
      <SummaryView
        loading={phase === "summarizing"}
        summary={summary}
        error={summaryError}
        lost={lost}
        transcript={transcriptRef.current}
        onRetry={runSummary}
        onRestart={reset}
      />
    );
  }

  if (session && phase === "live") {
    if (!LIVEKIT_URL) return <Unavailable onBack={reset} />;
    return (
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={session.token}
        connect
        audio
        video={false}
        onDisconnected={handleDisconnected}
        options={{ stopLocalTrackOnUnpublish: false }}
      >
        <RoomAudioRenderer />
        <ActiveSession
          onEnd={handleEndByUser}
          onTranscriptChange={(t) => { transcriptRef.current = t; }}
        />
      </LiveKitRoom>
    );
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

export default React.memo(VoiceInterview);
