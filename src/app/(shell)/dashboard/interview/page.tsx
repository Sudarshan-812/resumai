"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PaperPlaneTilt as Send, ArrowCounterClockwise as RotateCcw, CheckCircle as CheckCircle2, WarningCircle as AlertCircle,
  CaretRight as ChevronRight, Microphone as Mic, ArrowRight,
} from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import VoiceInterview from "./VoiceInterview";
import UpgradeModal from "@/app/components/UpgradeModal";
import { useInterviewState } from "./useInterviewState";
import { NumberTicker } from "@/components/dashboard/number-ticker";
import { AuroraBackground } from "@/components/dashboard/aurora-background";

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
const scoreColor = (s: number) => s >= 70 ? "#059669" : s >= 50 ? "#d97706" : "#e11d48";

/* ── Step indicator ─────────────────────────────────────────── */
const STEPS = ["Setup", "Interview", "Results"] as const;

function StepBar({ phase, currentIdx, total }: { phase: string; currentIdx: number; total: number }) {
  const active = phase === "setup" ? 0 : phase === "complete" ? 2 : 1;

  return (
    <div className="relative z-10 flex items-start justify-center gap-0 pt-2 pb-1">
      {STEPS.map((label, i) => {
        const done    = i < active;
        const current = i === active;
        const dotColor = done ? "#059669" : current ? "#12a594" : "#D4D0C8";
        const textColor = done ? "#059669" : current ? "#12a594" : "#b9bbc6";
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
                <div className="relative overflow-hidden rounded-full bg-border" style={{ width: 56, height: 1.5 }}>
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
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5 text-muted-foreground">
        {label}
        {hint && <span className="ml-2 normal-case font-normal tracking-normal text-muted-foreground/70">- {hint}</span>}
      </p>
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-2 text-[14px] bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/40 border-b-2 transition-colors"
          style={{ borderColor: focused ? "#12a594" : "var(--border)" }}
        />
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
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2.5 text-muted-foreground">
        {label}
        {hint && <span className="ml-2 normal-case font-normal tracking-normal text-muted-foreground/70">- {hint}</span>}
      </p>
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-[13.5px] leading-[1.85] resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/40 pb-2 border-b-2 transition-colors"
          style={{ borderColor: focused ? "#12a594" : "var(--border)" }}
        />
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const {
    refreshPlan,
    jobDesc, setJobDesc, role, setRole,
    questions, currentIdx, answer, setAnswer,
    feedbacks, phase, loading, avgScore,
    generateQuestions, submitAnswer, nextQuestion, reset,
  } = useInterviewState();

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [elapsed, setElapsed]             = useState(0);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!isVoiceActive) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isVoiceActive]);

  const handleVoiceActiveChange = useCallback((active: boolean) => setIsVoiceActive(active), []);

  return (
    <>
      <div className="bg-background min-h-full">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative mb-8 rounded-3xl overflow-hidden border border-border px-6 pt-7"
          >
            <AuroraBackground className="opacity-60" />
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <motion.span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] bg-primary/10 text-primary border border-primary/20"
              >
                <motion.span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }} />
                Live AI
              </motion.span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em] bg-secondary text-muted-foreground border border-border">
                Signature Feature · Free
              </span>
            </div>

            <h1 className="relative z-10 font-display font-semibold tracking-tight mb-2 text-foreground" style={{ fontSize: "clamp(24px, 5vw, 36px)", lineHeight: 1.15 }}>
              AI Interview
            </h1>
            <p className="relative z-10 text-[14px] leading-relaxed pb-5 text-muted-foreground">
              Real-time AI interviewer - speak naturally or practice with text.
            </p>

            <StepBar phase={phase} currentIdx={currentIdx} total={questions.length} />
          </motion.div>

          {/* ── Voice section ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-10"
          >
            {/* Live session strip (no box, floating on background) */}
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div
                  key="live-strip"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={SPRING}
                  className="flex items-center justify-between mb-4 px-4 py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15"
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div className="w-2 h-2 rounded-full bg-rose-600"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }} />
                    <span className="text-[11px] font-semibold text-rose-600">Recording</span>
                  </div>
                  <span className="text-[13px] font-mono tabular-nums font-bold text-rose-600">
                    {fmt(elapsed)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <VoiceInterview
              onActiveChange={handleVoiceActiveChange}
            />
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
              or practice with text
            </span>
            <div className="flex-1 h-px bg-border" />
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
                    onClick={() => generateQuestions(() => setUpgradeModalOpen(true))}
                    disabled={!role.trim() || jobDesc.trim().length < 50 || loading}
                    whileHover={!loading ? { y: -2, boxShadow: "0 16px 36px rgba(18,165,148,0.28)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35 bg-primary shadow-lg shadow-primary/20"
                  >
                    {loading
                      ? <><CoinLoader size={18} className="text-current" />Generating questions…</>
                      : <><Mic size={18} />Start Interview</>
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
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
                        className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {questions[currentIdx].category}
                      </motion.span>
                    </div>
                    <div className="h-[2px] rounded-full overflow-hidden bg-border">
                      <motion.div className="h-full rounded-full bg-primary"
                        animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.6, ease: EASE }} />
                    </div>
                  </div>

                  {/* Question text - left accent line, no box */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06, type: "spring", stiffness: 260, damping: 26 }}
                    className="pl-4 border-l-[3px] border-primary"
                  >
                    <p className="text-[15px] font-medium leading-[1.75] text-foreground">
                      {questions[currentIdx].question}
                    </p>
                  </motion.div>

                  <UTextarea value={answer} onChange={setAnswer}
                    placeholder="Use the STAR method: Situation, Task, Action, Result…"
                    label="Your Answer" rows={6} />

                  <motion.button
                    onClick={submitAnswer}
                    disabled={answer.trim().length < 20 || loading}
                    whileHover={!loading ? { y: -2, boxShadow: "0 16px 36px rgba(18,165,148,0.28)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-35 bg-primary shadow-lg shadow-primary/20"
                  >
                    {loading
                      ? <><CoinLoader size={18} className="text-current" />Evaluating…</>
                      : <><Send size={16} />Submit Answer</>
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
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3 text-muted-foreground/60">Answer Score</p>
                    <div className="flex items-baseline gap-2">
                      <NumberTicker
                        value={feedbacks[currentIdx].score}
                        className="font-black leading-none"
                        style={{ fontSize: 56, fontFamily: "monospace", letterSpacing: "-0.04em", color: scoreColor(feedbacks[currentIdx].score) } as React.CSSProperties}
                      />
                      <span className="text-[14px] font-semibold pb-1 text-muted-foreground/60">/100</span>
                    </div>
                    <div className="mt-3 h-[2px] rounded-full overflow-hidden bg-border">
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
                      <div className="h-px bg-border mb-5" />
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-600">What worked</span>
                      </div>
                      <ul className="space-y-3">
                        {feedbacks[currentIdx].strengths.map((s, i) => (
                          <motion.li key={i}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.14 + i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                            className="flex items-start gap-3 text-[13.5px] leading-relaxed text-foreground/90"
                          >
                            <ChevronRight size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Improvements */}
                  {feedbacks[currentIdx].improvements.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                      <div className="h-px bg-border mb-5" />
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={16} className="text-amber-600" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-600">To improve</span>
                      </div>
                      <ul className="space-y-3">
                        {feedbacks[currentIdx].improvements.map((s, i) => (
                          <motion.li key={i}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                            className="flex items-start gap-3 text-[13.5px] leading-relaxed text-foreground/90"
                          >
                            <ChevronRight size={16} className="text-amber-600 mt-0.5 shrink-0" />
                            {s}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Model answer hint */}
                  {feedbacks[currentIdx].model_answer_hint && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                      <div className="h-px bg-border mb-5" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-3 text-primary">Strong approach</p>
                      <p className="text-[13.5px] leading-[1.85] pl-4 text-foreground/90 border-l-[3px] border-primary/35">
                        {feedbacks[currentIdx].model_answer_hint}
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={nextQuestion}
                    whileHover={{ y: -2, boxShadow: "0 16px 36px rgba(18,165,148,0.28)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING}
                    className="w-full h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 bg-primary shadow-lg shadow-primary/20"
                  >
                    {currentIdx < questions.length - 1 ? (
                      <>Next Question <ArrowRight size={16} /></>
                    ) : (
                      <>See Results <ArrowRight size={16} /></>
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
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3 text-muted-foreground/60">
                      Final Score
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <NumberTicker
                        value={avgScore}
                        className="font-black leading-none"
                        style={{ fontSize: 64, fontFamily: "monospace", letterSpacing: "-0.04em", color: scoreColor(avgScore) } as React.CSSProperties}
                      />
                      <span className="text-[16px] font-semibold pb-1.5 text-muted-foreground/60">/100</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">{questions.length} questions answered</p>
                    <div className="mt-4 h-[2px] rounded-full overflow-hidden bg-border">
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${avgScore}%` }}
                        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
                        style={{ background: scoreColor(avgScore) }} />
                    </div>
                  </div>

                  {/* Per-question breakdown */}
                  <div>
                    <div className="h-px bg-border mb-5" />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-5 text-muted-foreground/60">Breakdown</p>
                    <div className="space-y-0">
                      {feedbacks.map((fb, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07, type: "spring", stiffness: 280, damping: 26 }}
                          className={`flex items-center justify-between py-4 ${i < feedbacks.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <div>
                            <p className="text-[12px] font-semibold text-foreground">Q{i + 1}</p>
                            <p className="text-[11px] text-muted-foreground">{questions[i]?.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-[2px] rounded-full overflow-hidden bg-border">
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
                      className="flex-1 h-11 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 border border-border text-muted-foreground bg-card">
                      <RotateCcw size={16} /> Try again
                    </motion.button>
                    <motion.button onClick={() => { window.location.href = "/dashboard"; }}
                      whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(18,165,148,0.24)" }} whileTap={{ scale: 0.97 }} transition={SPRING}
                      className="flex-1 h-11 rounded-xl text-[12px] font-bold text-white flex items-center justify-center bg-primary shadow-md shadow-primary/20">
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
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={refreshPlan}
      />
    </>
  );
}
