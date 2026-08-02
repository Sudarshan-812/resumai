"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";

export interface Question { question: string; category: string }
export interface Feedback { score: number; strengths: string[]; improvements: string[]; model_answer_hint: string }
export type Phase = "setup" | "questions" | "answering" | "feedback" | "complete";

async function parseError(res: Response): Promise<string> {
  try { const d = await res.json(); return d.error || d.message || `Error ${res.status}`; } catch {}
  try { return (await res.text()) || `Error ${res.status}`; } catch {}
  return `Error ${res.status}`;
}

export function useInterviewState() {
  const [userPlan, setUserPlan] = useState("free");
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

  const generateQuestions = useCallback(async (onLimitReached: () => void) => {
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
        if (payload.error === "interview_limit_reached") { onLimitReached(); return; }
      }
      if (!res.ok) throw new Error(await parseError(res));
      const data = await res.json();
      if (!data.questions?.length) throw new Error("No questions returned.");
      setQuestions(data.questions);
      setCurrentIdx(0);
      setFeedbacks([]);
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
      const next = [...feedbacks, fb];
      setFeedbacks(next);
      setAnswer("");
      setPhase(currentIdx + 1 >= questions.length ? "complete" : "feedback");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  }, [answer, loading, questions, currentIdx, feedbacks, role, jobDesc]);

  const nextQuestion = useCallback(() => {
    setCurrentIdx(i => i + 1);
    setPhase("questions");
  }, []);

  const reset = useCallback(() => {
    setQuestions([]);
    setFeedbacks([]);
    setCurrentIdx(0);
    setAnswer("");
    setPhase("setup");
  }, []);

  const avgScore = feedbacks.length > 0
    ? Math.round(feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length)
    : 0;

  return {
    userPlan, setUserPlan, refreshPlan,
    jobDesc, setJobDesc,
    role, setRole,
    questions, currentIdx,
    answer, setAnswer,
    feedbacks, phase,
    loading,
    avgScore,
    generateQuestions, submitAnswer, nextQuestion, reset,
  };
}
