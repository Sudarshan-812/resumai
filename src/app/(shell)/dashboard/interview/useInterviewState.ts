"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface Question { question: string; category: string }
export interface Feedback { score: number; strengths: string[]; improvements: string[]; model_answer_hint: string }
export type Phase = "setup" | "questions" | "feedback" | "complete";

async function parseError(res: Response): Promise<string> {
  try { const d = await res.json(); return d.error || d.message || `Error ${res.status}`; } catch {}
  try { return (await res.text()) || `Error ${res.status}`; } catch {}
  return `Error ${res.status}`;
}

export function useInterviewState() {
  const [jobDesc, setJobDesc] = useState("");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);

  const generateQuestions = useCallback(async () => {
    if (!role.trim() || !jobDesc.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, jobDesc }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      const data = await res.json();
      if (!data.questions?.length) throw new Error("No questions returned.");
      setQuestions(data.questions);
      setCurrentIdx(0);
      setFeedbacks([]);
      setAnswers([]);
      setPhase("questions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  }, [role, jobDesc]);

  const submitAnswer = useCallback(async () => {
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
      setFeedbacks((prev) => [...prev, fb]);
      setAnswers((prev) => [...prev, answer.trim()]);
      setAnswer("");
      setPhase(currentIdx + 1 >= questions.length ? "complete" : "feedback");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  }, [answer, loading, questions, currentIdx, role, jobDesc]);

  const nextQuestion = useCallback(() => {
    setCurrentIdx(i => i + 1);
    setPhase("questions");
  }, []);

  const reset = useCallback(() => {
    setQuestions([]);
    setFeedbacks([]);
    setAnswers([]);
    setCurrentIdx(0);
    setAnswer("");
    setPhase("setup");
  }, []);

  const avgScore = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length)
    : 0;

  return {
    jobDesc, setJobDesc,
    role, setRole,
    questions, currentIdx,
    answer, setAnswer,
    answers,
    feedbacks, phase,
    loading,
    avgScore,
    generateQuestions, submitAnswer, nextQuestion, reset,
  };
}
