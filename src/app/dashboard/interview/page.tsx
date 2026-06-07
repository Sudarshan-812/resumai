"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Send, RotateCcw, CheckCircle2, AlertCircle,
  ChevronRight, Mic, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import DashboardShell from "@/app/dashboard/DashboardShell";
import VoiceInterview from "./VoiceInterview";
import UpgradeModal from "@/app/components/UpgradeModal";
import { createClient } from "@/app/lib/supabase/client";

interface Question { question: string; category: string }
interface Feedback { score: number; strengths: string[]; improvements: string[]; model_answer_hint: string }
type Phase = "setup" | "questions" | "answering" | "feedback" | "complete";

const EASE = [0.16, 1, 0.3, 1] as const;

function CountUpScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const t0 = performance.now();
    const dur = 800;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display}</>;
}

const scoreColor = (s: number) => s >= 70 ? "#059669" : s >= 50 ? "#d97706" : "#e11d48";

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const inputStyle = {
  background: "#FFFFFF",
  border: "1.5px solid #E5E3DC",
  color: "#111111",
  transition: "border-color 0.2s",
};

export default function InterviewPage() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [userPlan, setUserPlan] = useState<string>("free");
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; reason: "voice" | "limit" }>({ open: false, reason: "voice" });

  const [jobDesc, setJobDesc] = useState("");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      if (data?.plan) setUserPlan(data.plan);
    })();
  }, []);

  const refreshPlan = useCallback(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      if (data?.plan) setUserPlan(data.plan);
    })();
  }, []);

  useEffect(() => {
    if (!isVoiceActive) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isVoiceActive]);

  const handleVoiceActiveChange = useCallback((active: boolean) => {
    setIsVoiceActive(active);
  }, []);

  const parseError = async (res: Response): Promise<string> => {
    try { const d = await res.json(); return d.error || d.message || `Error ${res.status}`; } catch {}
    try { return (await res.text()) || `Error ${res.status}`; } catch {}
    return `Error ${res.status}`;
  };

  const generateQuestions = async () => {
    if (!role.trim() || !jobDesc.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, jobDesc }),
      });
      if (res.status === 402) {
        const payload = await res.json().catch(() => ({})) as { error?: string };
        if (payload.error === "interview_limit_reached") {
          setUpgradeModal({ open: true, reason: "limit" });
          return;
        }
      }
      if (!res.ok) throw new Error(await parseError(res));
      const data = await res.json();
      if (!data.questions?.length) throw new Error("No questions returned.");
      setQuestions(data.questions);
      setCurrentIdx(0);
      setFeedbacks([]);
      setPhase("questions");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[currentIdx].question, answer, role, jobDesc }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      const fb: Feedback = await res.json();
      if (typeof fb.score !== "number") throw new Error("Invalid feedback response.");
      const next = [...feedbacks, fb];
      setFeedbacks(next);
      setAnswer("");
      setPhase(currentIdx + 1 >= questions.length ? "complete" : "feedback");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => { setCurrentIdx(i => i + 1); setPhase("questions"); };
  const reset = () => { setQuestions([]); setFeedbacks([]); setCurrentIdx(0); setAnswer(""); setPhase("setup"); };
  const avgScore = feedbacks.length > 0 ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length) : 0;

  return (
    <DashboardShell>
      <div className="min-h-full" style={{ background: "#F7F6F2" }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* ── Voice Section (clean, light) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-10"
          >
            {/* Header area */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
                  style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: "#06b6d4" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  Live AI
                </motion.span>
                <span
                  className="px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em]"
                  style={{ background: "#F0EFE9", color: "#C8C4BB", border: "1px solid #E5E3DC" }}
                >
                  Signature Feature
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2" style={{ color: "#111111" }}>
                Voice AI Interview
              </h1>
              <p className="text-sm max-w-md leading-relaxed" style={{ color: "#6B6860" }}>
                Real-time AI interviewer trained on your resume. Speak naturally — no typing required.
              </p>
            </div>

            {/* Voice interview card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
            >
              {/* Active session header strip */}
              <AnimatePresence>
                {isVoiceActive && (
                  <motion.div
                    key="session-header"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between px-6 py-3.5"
                    style={{ borderBottom: "1px solid #E5E3DC", background: "#FAFAF8" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(225,29,72,0.07)", border: "1px solid rgba(225,29,72,0.18)" }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#e11d48" }}
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "#e11d48" }}>Live</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "#111111" }}>Voice Interview</span>
                    </div>
                    <span className="text-sm font-mono tabular-nums font-medium" style={{ color: "#9B9890" }}>
                      {fmt(elapsed)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 md:p-8">
                <VoiceInterview
                  onActiveChange={handleVoiceActiveChange}
                  userPlan={userPlan}
                  onUpgradeNeeded={() => setUpgradeModal({ open: true, reason: "voice" })}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: "#E5E3DC" }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: "#C8C4BB" }}>
              Or practice with text
            </span>
            <div className="flex-1 h-px" style={{ background: "#E5E3DC" }} />
          </div>

          {/* ── Text Mode ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: EASE }}
          >
            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1" style={{ color: "#9B9890" }}>Text Mode</p>
              <p className="text-sm" style={{ color: "#9B9890" }}>AI generates role-specific questions and evaluates your written answers.</p>
            </div>

            <AnimatePresence mode="wait">

              {/* Setup */}
              {phase === "setup" && (
                <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>Job Title</label>
                    <input
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="Product Manager"
                      className="w-full h-10 px-3.5 rounded-lg text-sm focus:outline-none"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = "#06b6d4"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#E5E3DC"; }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>
                      Job Description{" "}
                      <span className="normal-case font-normal tracking-normal" style={{ color: "#C8C4BB" }}>— paste key requirements</span>
                    </label>
                    <textarea
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                      placeholder="Paste the job description here…"
                      rows={6}
                      className="w-full px-3.5 py-3 rounded-lg text-sm focus:outline-none resize-none"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = "#06b6d4"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#E5E3DC"; }}
                    />
                  </div>
                  <motion.button
                    onClick={generateQuestions}
                    disabled={!role.trim() || jobDesc.trim().length < 50 || loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                    style={{ background: "#06b6d4", boxShadow: "0 4px 16px rgba(6,182,212,0.22)" }}
                  >
                    {loading ? <><Loader2 size={14} className="animate-spin" />Generating…</> : <><Mic size={14} />Start Text Interview</>}
                  </motion.button>
                </motion.div>
              )}

              {/* Question */}
              {(phase === "questions" || phase === "answering") && questions[currentIdx] && (
                <motion.div key={`q-${currentIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono" style={{ color: "#9B9890" }}>
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(6,182,212,0.08)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.15)" }}
                    >
                      {questions[currentIdx].category}
                    </span>
                  </div>

                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "#E5E3DC" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "#06b6d4" }}
                      animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </div>

                  <div className="rounded-xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}>
                    <p className="text-[14.5px] font-medium leading-relaxed" style={{ color: "#111111" }}>
                      {questions[currentIdx].question}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>Your Answer</label>
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Use the STAR method: Situation, Task, Action, Result…"
                      rows={6}
                      className="w-full px-3.5 py-3 rounded-lg text-sm focus:outline-none resize-none"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = "#06b6d4"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#E5E3DC"; }}
                    />
                  </div>

                  <motion.button
                    onClick={submitAnswer}
                    disabled={answer.trim().length < 20 || loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                    style={{ background: "#06b6d4", boxShadow: "0 4px 16px rgba(6,182,212,0.22)" }}
                  >
                    {loading ? <><Loader2 size={14} className="animate-spin" />Evaluating…</> : <><Send size={13} />Submit Answer</>}
                  </motion.button>
                </motion.div>
              )}

              {/* Feedback */}
              {phase === "feedback" && feedbacks[currentIdx] && (
                <motion.div key={`fb-${currentIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                  <div className="rounded-xl p-5 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: "#9B9890" }}>Answer Score</p>
                    <div className="text-5xl font-bold tracking-tighter mb-1" style={{ color: scoreColor(feedbacks[currentIdx].score) }}>
                      <CountUpScore value={feedbacks[currentIdx].score} />
                    </div>
                    <p className="text-[11px]" style={{ color: "#9B9890" }}>out of 100</p>
                  </div>

                  {feedbacks[currentIdx].strengths.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="rounded-xl p-5" style={{ background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.15)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={13} style={{ color: "#059669" }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] font-semibold" style={{ color: "#059669" }}>What worked well</span>
                      </div>
                      <ul className="space-y-1.5">
                        {feedbacks[currentIdx].strengths.map((s, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "#111111" }}>
                            <ChevronRight size={12} style={{ color: "#059669", marginTop: 2 }} className="shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {feedbacks[currentIdx].improvements.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      className="rounded-xl p-5" style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.15)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={13} style={{ color: "#d97706" }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] font-semibold" style={{ color: "#d97706" }}>To improve</span>
                      </div>
                      <ul className="space-y-1.5">
                        {feedbacks[currentIdx].improvements.map((s, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "#111111" }}>
                            <ChevronRight size={12} style={{ color: "#d97706", marginTop: 2 }} className="shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {feedbacks[currentIdx].model_answer_hint && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="rounded-xl p-5" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: "#06b6d4" }}>Strong answer approach</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#111111" }}>{feedbacks[currentIdx].model_answer_hint}</p>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={nextQuestion}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: "#06b6d4", boxShadow: "0 4px 16px rgba(6,182,212,0.22)" }}
                  >
                    Next Question <ArrowRight size={14} />
                  </motion.button>
                </motion.div>
              )}

              {/* Complete */}
              {phase === "complete" && (
                <motion.div key="complete" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="rounded-xl p-8 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-3" style={{ color: "#9B9890" }}>Interview Complete</p>
                    <div className="text-5xl font-bold tracking-tighter mb-1" style={{ color: scoreColor(avgScore) }}>
                      <CountUpScore value={avgScore} />
                    </div>
                    <p className="text-[11px] mb-1" style={{ color: "#9B9890" }}>average score</p>
                    <p className="text-sm" style={{ color: "#9B9890" }}>{questions.length} questions answered</p>
                  </div>

                  <div className="space-y-2">
                    {feedbacks.map((fb, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between px-4 py-3 rounded-lg"
                        style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
                      >
                        <span className="text-sm" style={{ color: "#6B6860" }}>Q{i + 1}: {questions[i]?.category}</span>
                        <span className="text-sm font-bold tabular-nums font-mono" style={{ color: scoreColor(fb.score) }}>
                          {fb.score}/100
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={reset}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      style={{ background: "#F7F6F2", border: "1px solid #E5E3DC", color: "#6B6860" }}
                    >
                      <RotateCcw size={13} />Try Again
                    </motion.button>
                    <motion.button
                      onClick={() => { window.location.href = "/dashboard"; }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-lg text-sm font-semibold text-white flex items-center justify-center"
                      style={{ background: "#06b6d4", boxShadow: "0 4px 16px rgba(6,182,212,0.22)" }}
                    >
                      Back to Dashboard
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

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
