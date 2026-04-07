"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronLeft, Loader2, Send, RotateCcw, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavbarWrapper from "@/app/dashboard/NavbarWrapper";

interface Question {
  question: string;
  category: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  model_answer_hint: string;
}

type Phase = "setup" | "questions" | "answering" | "feedback" | "complete";

export default function InterviewPage() {
  const [jobDesc, setJobDesc] = useState("");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    if (!role.trim() || !jobDesc.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, jobDesc }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setQuestions(data.questions);
      setCurrentIdx(0);
      setFeedbacks([]);
      setPhase("questions");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
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
        body: JSON.stringify({
          question: questions[currentIdx].question,
          answer,
          role,
          jobDesc,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const fb: Feedback = await res.json();
      const newFeedbacks = [...feedbacks, fb];
      setFeedbacks(newFeedbacks);
      setAnswer("");

      if (currentIdx + 1 >= questions.length) {
        setPhase("complete");
      } else {
        setPhase("feedback");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setCurrentIdx(i => i + 1);
    setPhase("questions");
  };

  const reset = () => {
    setQuestions([]);
    setFeedbacks([]);
    setCurrentIdx(0);
    setAnswer("");
    setPhase("setup");
  };

  const avgScore = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-16 px-4">
      <NavbarWrapper />
      <div className="max-w-2xl mx-auto pt-28">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
            <BarChart3 size={12} /> Interview Simulator
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Practice makes perfect.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            AI generates role-specific questions and gives you instant feedback on your answers.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* SETUP */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Job Title</label>
                <input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Job Description <span className="normal-case font-normal text-muted-foreground/60">(paste key requirements)</span>
                </label>
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={7}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                />
              </div>

              <Button
                onClick={generateQuestions}
                disabled={!role.trim() || jobDesc.trim().length < 50 || loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {loading ? <><Loader2 size={15} className="animate-spin mr-2" /> Generating...</> : "Start Interview"}
              </Button>
            </motion.div>
          )}

          {/* QUESTION */}
          {(phase === "questions" || phase === "answering") && questions[currentIdx] && (
            <motion.div key={`q-${currentIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  {questions[currentIdx].category}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full bg-primary"
                  animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Question card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-base font-medium text-foreground leading-relaxed">{questions[currentIdx].question}</p>
              </div>

              {/* Answer input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here... Use the STAR method: Situation, Task, Action, Result"
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                />
              </div>

              <Button
                onClick={submitAnswer}
                disabled={answer.trim().length < 20 || loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {loading ? <><Loader2 size={15} className="animate-spin mr-2" /> Evaluating...</> : <><Send size={14} className="mr-2" /> Submit Answer</>}
              </Button>
            </motion.div>
          )}

          {/* FEEDBACK */}
          {phase === "feedback" && feedbacks[currentIdx] && (
            <motion.div key={`fb-${currentIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Score */}
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Answer Score</p>
                <div className={cn(
                  "text-5xl font-bold font-mono tracking-tighter mb-1",
                  feedbacks[currentIdx].score >= 70 ? "text-emerald-500" : feedbacks[currentIdx].score >= 50 ? "text-amber-500" : "text-rose-500"
                )}>
                  {feedbacks[currentIdx].score}
                </div>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>

              {/* Strengths */}
              {feedbacks[currentIdx].strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">What worked well</span>
                  </div>
                  <ul className="space-y-1.5">
                    {feedbacks[currentIdx].strengths.map((s, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <ChevronRight size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedbacks[currentIdx].improvements.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={13} className="text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">To improve</span>
                  </div>
                  <ul className="space-y-1.5">
                    {feedbacks[currentIdx].improvements.map((s, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <ChevronRight size={12} className="text-amber-500 mt-0.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Model answer hint */}
              {feedbacks[currentIdx].model_answer_hint && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Strong answer approach</p>
                  <p className="text-sm text-foreground leading-relaxed">{feedbacks[currentIdx].model_answer_hint}</p>
                </div>
              )}

              <Button onClick={nextQuestion} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                Next Question <ChevronRight size={14} className="ml-1" />
              </Button>
            </motion.div>
          )}

          {/* COMPLETE */}
          {phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className="text-5xl mb-4">{avgScore >= 70 ? "🎯" : avgScore >= 50 ? "📈" : "💪"}</div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">Interview Complete</h2>
                <p className="text-sm text-muted-foreground mb-6">You answered {questions.length} questions.</p>
                <div className={cn(
                  "text-6xl font-bold font-mono tracking-tighter mb-2",
                  avgScore >= 70 ? "text-emerald-500" : avgScore >= 50 ? "text-amber-500" : "text-rose-500"
                )}>
                  {avgScore}
                </div>
                <p className="text-xs text-muted-foreground">average score</p>
              </div>

              {/* Per-question breakdown */}
              <div className="space-y-2">
                {feedbacks.map((fb, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card">
                    <span className="text-sm text-muted-foreground">Q{i + 1}: {questions[i]?.category}</span>
                    <span className={cn(
                      "text-sm font-bold font-mono",
                      fb.score >= 70 ? "text-emerald-500" : fb.score >= 50 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {fb.score}/100
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={reset} variant="outline" className="flex-1 h-11 rounded-xl border-border font-semibold">
                  <RotateCcw size={14} className="mr-2" /> Try Again
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
