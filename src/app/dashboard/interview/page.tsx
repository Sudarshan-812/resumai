"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Send, RotateCcw, CheckCircle2, AlertCircle,
  ChevronRight, Mic, ArrowRight,
} from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";
import VoiceInterview from "./VoiceInterview";
import UpgradeModal from "@/app/components/UpgradeModal";
import { useInterviewState } from "./useInterviewState";

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
const scoreColor = (s: number) => s >= 70 ? "#059669" : s >= 50 ? "#d97706" : "#e11d48";

/* ── Count-up ────────────────────────────────────────────────── */
function CountUp({ value, size = 48 }: { value: number; size?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let f: number;
    const t0 = performance.now(), dur = 900;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) f = requestAnimationFrame(tick);
    };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [value]);
  return (
    <motion.span
      animate={{ scale: [1, 1.07, 0.97, 1] }}
      transition={{ delay: 0.85, duration: 0.4, ease: EASE }}
      style={{ fontSize: size, fontWeight: 900, fontFamily: "monospace", color: scoreColor(value), letterSpacing: "-0.04em", lineHeight: 1, display: "inline-block" }}
    >
      {n}
    </motion.span>
  );
}

/* ── Step indicator (white layer) ───────────────────────────── */
const STEPS = ["Setup", "Interview", "Results"] as const;

function StepBar({ phase, currentIdx, total }: { phase: string; currentIdx: number; total: number }) {
  const active = phase === "setup" ? 0 : phase === "complete" ? 2 : 1;

  return (
    <div className="flex items-start justify-center gap-0 py-5 px-6"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
      {STEPS.map((label, i) => {
        const done    = i < active;
        const current = i === active;
        const dotColor = done ? "#059669" : current ? "#06b6d4" : "#D4D0C8";
        const textColor = done ? "#059669" : current ? "#06b6d4" : "#C8C4BB";
        const displayLabel = i === 1 && total > 0 && !["setup", "complete"].includes(phase)
          ? `Q ${currentIdx + 1}/${total}`
          : label;

        return (
          <div key={label} className="flex items-start">
            {/* Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center" style={{ width: 28, height: 28 }}>
                {/* Pulse ring for current step */}
                {current && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1.5px solid ${dotColor}` }}
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <motion.div
                  className="rounded-full flex items-center justify-center"
                  animate={{
                    width:  current ? 10 : done ? 8 : 6,
                    height: current ? 10 : done ? 8 : 6,
                    background: dotColor,
                  }}
                  transition={SPRING}
                />
              </div>
              <motion.span
                animate={{ color: textColor }}
                transition={{ duration: 0.3 }}
                className="text-[9px] font-mono uppercase tracking-[0.14em] font-semibold text-center"
                style={{ minWidth: 52 }}
              >
                {displayLabel}
              </motion.span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex items-center" style={{ paddingTop: 13, marginLeft: 4, marginRight: 4 }}>
                <div className="relative overflow-hidden" style={{ width: 56, height: 1.5, background: "#E5E3DC", borderRadius: 99 }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{ background: "#059669" }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Underline input ─────────────────────────────────────────── */
function UInput({ value, onChange, placeholder, label, hint }: {
  value: string; onChange: (v: string) => void;
  placeholder: string; label: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5" style={{ color: "#6B6860" }}>
        {label}
        {hint && <span className="ml-2 normal-case font-normal tracking-normal" style={{ color: "#9B9890" }}>— {hint}</span>}
      </p>
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-2 text-[14px] bg-transparent focus:outline-none placeholder:text-[#B8B4AA]"
          style={{ color: "#111111", borderBottom: `1px solid ${focused ? "#06b6d4" : "#C8C4BB"}`, transition: "border-color 0.2s" }}
        />
        {focused && (
          <motion.div className="absolute bottom-0 left-0 h-[2px] rounded-full"
            initial={{ width: 0 }} animate={{ width: "100%" }}
            style={{ background: "#06b6d4" }} transition={{ duration: 0.25, ease: EASE }} />
        )}
      </div>
    </div>
  );
}

function UTextarea({ value, onChange, placeholder, label, hint, rows = 6 }: {
  value: string; onChange: (v: string) => void;
  placeholder: string; label: string; hint?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5" style={{ color: "#6B6860" }}>
        {label}
        {hint && <span className="ml-2 normal-case font-normal tracking-normal" style={{ color: "#9B9890" }}>— {hint}</span>}
      </p>
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-[13.5px] leading-[1.85] resize-none focus:outline-none placeholder:text-[#B8B4AA] pb-2"
          style={{ color: "#111111", borderBottom: `1px solid ${focused ? "#06b6d4" : "#C8C4BB"}`, transition: "border-color 0.2s" }}
        />
        {focused && (
          <motion.div className="absolute bottom-0 left-0 h-[2px] rounded-full"
            initial={{ width: 0 }} animate={{ width: "100%" }}
            style={{ background: "#06b6d4" }} transition={{ duration: 0.28, ease: EASE }} />
        )}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const {
    userPlan, refreshPlan,
    jobDesc, setJobDesc, role, setRole,
    questions, currentIdx, answer, setAnswer,
    feedbacks, phase, loading, avgScore,
    generateQuestions, submitAnswer, nextQuestion, reset,
  } = useInterviewState();

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [elapsed, setElapsed]             = useState(0);
  const [upgradeModal, setUpgradeModal]   = useState<{ open: boolean; reason: "voice" | "limit" }>({ open: false, reason: "voice" });

  useEffect(() => {
    if (!isVoiceActive) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isVoiceActive]);

  const handleVoiceActiveChange = useCallback((active: boolean) => setIsVoiceActive(active), []);

  return (
    <DashboardShell>
      <div style={{ background: "#F7F6F2", minHeight: "100%" }}>

        {/* ── White header ── */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
          <div className="max-w-3xl mx-auto px-6 md:px-10 pt-10 pb-0">
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
                  style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}
                >
                  <motion.span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#06b6d4", display: "inline-block" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }} />
                  Live AI
                </motion.span>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em]"
                  style={{ background: "#F0EFE9", color: "#9B9890", border: "1px solid #E5E3DC" }}>
                  Signature Feature
                </span>
              </div>

              <h1 className="font-display font-semibold tracking-tight mb-2"
                style={{ color: "#111111", fontSize: "clamp(24px, 5vw, 36px)", lineHeight: 1.15 }}>
                AI Interview
              </h1>
              <p className="text-[14px] leading-relaxed pb-7" style={{ color: "#6B6860" }}>
                Real-time AI interviewer — speak naturally or practice with text.
              </p>
            </motion.div>
          </div>

          {/* Step bar lives in the white section */}
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <StepBar phase={phase} currentIdx={currentIdx} total={questions.length} />
          </div>
        </div>

        {/* ── Cream content ── */}
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">

          {/* ── Voice section ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-10"
          >
            {/* Live session strip (no box, floating on cream) */}
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div
                  key="live-strip"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={SPRING}
                  className="flex items-center justify-between mb-4 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(225,29,72,0.05)", border: "1px solid rgba(225,29,72,0.15)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: "#e11d48" }}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }} />
                    <span className="text-[11px] font-semibold" style={{ color: "#e11d48" }}>Recording</span>
                  </div>
                  <span className="text-[13px] font-mono tabular-nums font-bold" style={{ color: "#e11d48" }}>
                    {fmt(elapsed)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <VoiceInterview
              onActiveChange={handleVoiceActiveChange}
              userPlan={userPlan}
              onUpgradeNeeded={() => setUpgradeModal({ open: true, reason: "voice" })}
            />
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ background: "#E5E3DC" }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "#C8C4BB" }}>
              or practice with text
            </span>
            <div className="flex-1 h-px" style={{ background: "#E5E3DC" }} />
          </div>

          {/* ── Text mode ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.4, ease: EASE }}
          >
            <AnimatePresence mode="wait">

              {/* ── Setup ── */}
              {phase === "setup" && (
                <motion.div key="setup"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="space-y-8"
                >
                  <UInput value={role} onChange={setRole} placeholder="Product Manager" label="Job Title" />
                  <UTextarea value={jobDesc} onChange={setJobDesc}
                    placeholder="Paste the job description here…"
                    label="Job Description" hint="paste key requirements" rows={6} />
                  <motion.button
                    onClick={() => generateQuestions(() => setUpgradeModal({ open: true, reason: "limit" }))}
                    disabled={!role.trim() || jobDesc.trim().length < 50 || loading}
                    whileHover={!loading ? { y: -2, boxShadow: "0 16px 36px rgba(6,182,212,0.28)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35"
                    style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 20px rgba(6,182,212,0.18)" }}
                  >
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" />Generating questions…</>
                      : <><Mic size={14} />Start Interview</>
                    }
                  </motion.button>
                </motion.div>
              )}

              {/* ── Question / Answering ── */}
              {(phase === "questions" || phase === "answering") && questions[currentIdx] && (
                <motion.div key={`q-${currentIdx}`}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="space-y-7"
                >
                  {/* Progress bar + meta */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono" style={{ color: "#9B9890" }}>
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
                        className="text-[9px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(6,182,212,0.08)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.18)" }}
                      >
                        {questions[currentIdx].category}
                      </motion.span>
                    </div>
                    <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#06b6d4" }}
                        animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.6, ease: EASE }} />
                    </div>
                  </div>

                  {/* Question text — left accent line, no box */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06, type: "spring", stiffness: 260, damping: 26 }}
                    className="pl-4"
                    style={{ borderLeft: "3px solid #06b6d4" }}
                  >
                    <p className="text-[15px] font-medium leading-[1.75]" style={{ color: "#111111" }}>
                      {questions[currentIdx].question}
                    </p>
                  </motion.div>

                  <UTextarea value={answer} onChange={setAnswer}
                    placeholder="Use the STAR method: Situation, Task, Action, Result…"
                    label="Your Answer" rows={6} />

                  <motion.button
                    onClick={submitAnswer}
                    disabled={answer.trim().length < 20 || loading}
                    whileHover={!loading ? { y: -2, boxShadow: "0 16px 36px rgba(6,182,212,0.28)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35"
                    style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 20px rgba(6,182,212,0.18)" }}
                  >
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" />Evaluating…</>
                      : <><Send size={13} />Submit Answer</>
                    }
                  </motion.button>
                </motion.div>
              )}

              {/* ── Feedback ── */}
              {phase === "feedback" && feedbacks[currentIdx] && (
                <motion.div key={`fb-${currentIdx}`}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 240, damping: 28 }}
                  className="space-y-8"
                >
                  {/* Score */}
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "#C8C4BB" }}>Answer Score</p>
                    <div className="flex items-baseline gap-2">
                      <CountUp value={feedbacks[currentIdx].score} size={56} />
                      <span className="text-[14px] font-semibold pb-1" style={{ color: "#C8C4BB" }}>/100</span>
                    </div>
                    <div className="mt-3 h-[2px] rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${feedbacks[currentIdx].score}%` }}
                        transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
                        style={{ background: scoreColor(feedbacks[currentIdx].score) }} />
                    </div>
                  </div>

                  {/* Strengths */}
                  {feedbacks[currentIdx].strengths.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                      <div style={{ height: 1, background: "#E5E3DC", marginBottom: 20 }} />
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={13} style={{ color: "#059669" }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: "#059669" }}>What worked</span>
                      </div>
                      <ul className="space-y-3">
                        {feedbacks[currentIdx].strengths.map((s, i) => (
                          <motion.li key={i}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.14 + i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                            className="flex items-start gap-3 text-[13.5px] leading-relaxed"
                            style={{ color: "#2D2C2A" }}
                          >
                            <ChevronRight size={12} style={{ color: "#059669", marginTop: 3 }} className="shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Improvements */}
                  {feedbacks[currentIdx].improvements.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                      <div style={{ height: 1, background: "#E5E3DC", marginBottom: 20 }} />
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={13} style={{ color: "#d97706" }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: "#d97706" }}>To improve</span>
                      </div>
                      <ul className="space-y-3">
                        {feedbacks[currentIdx].improvements.map((s, i) => (
                          <motion.li key={i}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                            className="flex items-start gap-3 text-[13.5px] leading-relaxed"
                            style={{ color: "#2D2C2A" }}
                          >
                            <ChevronRight size={12} style={{ color: "#d97706", marginTop: 3 }} className="shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Model answer hint */}
                  {feedbacks[currentIdx].model_answer_hint && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                      <div style={{ height: 1, background: "#E5E3DC", marginBottom: 20 }} />
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-3" style={{ color: "#06b6d4" }}>Strong approach</p>
                      <p className="text-[13.5px] leading-[1.85] pl-4"
                        style={{ color: "#2D2C2A", borderLeft: "3px solid rgba(6,182,212,0.35)" }}>
                        {feedbacks[currentIdx].model_answer_hint}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={nextQuestion}
                    whileHover={{ y: -2, boxShadow: "0 16px 36px rgba(6,182,212,0.28)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 20px rgba(6,182,212,0.18)" }}
                  >
                    {currentIdx < questions.length - 1 ? (
                      <>Next Question <ArrowRight size={14} /></>
                    ) : (
                      <>See Results <ArrowRight size={14} /></>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* ── Complete ── */}
              {phase === "complete" && (
                <motion.div key="complete"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                  className="space-y-8"
                >
                  {/* Overall score */}
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "#C8C4BB" }}>
                      Final Score
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <CountUp value={avgScore} size={64} />
                      <span className="text-[16px] font-semibold pb-1.5" style={{ color: "#C8C4BB" }}>/100</span>
                    </div>
                    <p className="text-[12px]" style={{ color: "#9B9890" }}>{questions.length} questions answered</p>
                    <div className="mt-4 h-[2px] rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${avgScore}%` }}
                        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
                        style={{ background: scoreColor(avgScore) }} />
                    </div>
                  </div>

                  {/* Per-question breakdown */}
                  <div>
                    <div style={{ height: 1, background: "#E5E3DC", marginBottom: 20 }} />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-5" style={{ color: "#C8C4BB" }}>Breakdown</p>
                    <div className="space-y-0">
                      {feedbacks.map((fb, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07, type: "spring", stiffness: 280, damping: 26 }}
                          className="flex items-center justify-between py-4"
                          style={{ borderBottom: i < feedbacks.length - 1 ? "1px solid #E5E3DC" : "none" }}
                        >
                          <div>
                            <p className="text-[12px] font-semibold" style={{ color: "#111111" }}>Q{i + 1}</p>
                            <p className="text-[11px]" style={{ color: "#9B9890" }}>{questions[i]?.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-[2px] rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                              <motion.div className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${fb.score}%` }}
                                transition={{ duration: 0.9, ease: EASE, delay: i * 0.07 + 0.2 }}
                                style={{ background: scoreColor(fb.score) }} />
                            </div>
                            <span className="text-[14px] font-black font-mono tabular-nums w-10 text-right"
                              style={{ color: scoreColor(fb.score), letterSpacing: "-0.02em" }}>
                              {fb.score}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button onClick={reset}
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                      className="flex-1 h-11 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"
                      style={{ border: "1px solid #E5E3DC", color: "#6B6860", background: "#FFFFFF" }}>
                      <RotateCcw size={13} /> Try again
                    </motion.button>
                    <motion.button onClick={() => { window.location.href = "/dashboard"; }}
                      whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(6,182,212,0.24)" }} whileTap={{ scale: 0.97 }} transition={SPRING}
                      className="flex-1 h-11 rounded-xl text-[12px] font-bold text-white flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.18)" }}>
                      Dashboard
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          <div className="h-10" />
        </div>
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        reason={upgradeModal.reason}
        onClose={() => setUpgradeModal(m => ({ ...m, open: false }))}
        onSuccess={refreshPlan}
      />
    </DashboardShell>
  );
}
