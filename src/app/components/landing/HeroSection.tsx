"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, LayoutDashboard, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0A0A0A" }}
      aria-labelledby="hero-heading"
    >
      {/* Radial indigo glow */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "700px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.13) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 text-center pt-32 pb-20">

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <Mic size={11} aria-hidden />
            Voice AI Interview — Now Live
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-bold text-white tracking-tight leading-[1.05] mb-6"
          style={{ fontSize: "clamp(40px, 6.5vw, 68px)" }}
        >
          Land more interviews.
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%)" }}
          >
            Beat the ATS filter.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "#888888" }}
        >
          Upload your resume, paste a job description, and get an AI-powered ATS score with
          specific rewrites — in under 60 seconds. Then practice with a live voice interviewer.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          {mounted && isLoggedIn ? (
            <>
              <Link href="/upload">
                <motion.span
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{ background: "#6366f1" }}
                >
                  <Sparkles size={14} aria-hidden />
                  Analyze My Resume
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </motion.span>
              </Link>
              <Link href="/dashboard">
                <motion.span
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-medium cursor-pointer"
                  style={{ background: "#111111", border: "1px solid #222222", color: "#aaaaaa" }}
                >
                  <LayoutDashboard size={14} aria-hidden />
                  Dashboard
                </motion.span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/try">
                <motion.span
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{ background: "#6366f1" }}
                >
                  <Sparkles size={14} aria-hidden />
                  Analyze My Resume Free
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </motion.span>
              </Link>
              <Link href="/login">
                <motion.span
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center h-12 px-7 rounded-xl text-sm font-medium cursor-pointer"
                  style={{ background: "#111111", border: "1px solid #222222", color: "#aaaaaa" }}
                >
                  Create Account
                </motion.span>
              </Link>
            </>
          )}
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-10 flex-wrap mb-20"
        >
          {[
            ["10,000+", "Resumes Scored"],
            ["94%",     "ATS Pass Rate"],
            ["< 60s",   "Analysis Time"],
          ].map(([stat, label]) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white font-mono">{stat}</span>
              <span className="text-xs mt-1" style={{ color: "#555555" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-4xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-2xl"
            style={{ background: "#111111", border: "1px solid #1f1f1f", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}
            >
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(234,179,8,0.5)" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.5)" }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div
                  className="h-5 w-48 rounded-md flex items-center justify-center"
                  style={{ background: "#1a1a1a" }}
                >
                  <span className="text-[9px] font-mono" style={{ color: "#555555" }}>resumai.in/dashboard/report</span>
                </div>
              </div>
            </div>

            {/* Report content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-left">

              {/* ATS Score */}
              <div
                className="col-span-1 flex flex-col items-center justify-center rounded-xl p-6"
                style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
              >
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#555555" }}>
                  ATS Match Score
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="#1a1a1a" strokeWidth="5" />
                    <motion.circle
                      cx="48" cy="48" r="44"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="276"
                      initial={{ strokeDashoffset: 276 }}
                      animate={{ strokeDashoffset: 22 }}
                      transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-white font-mono leading-none">92</span>
                    <span className="text-[9px] mt-0.5" style={{ color: "#555555" }}>/ 100</span>
                  </div>
                </div>
                <div
                  className="mt-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
                >
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  +24 pts after optimize
                </div>
              </div>

              {/* AI Suggestions */}
              <div
                className="col-span-1 flex flex-col justify-center rounded-xl p-6 md:col-span-2"
                style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Zap size={12} style={{ color: "#6366f1" }} aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#555555" }}>
                    AI Suggestions
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { color: "rgba(34,197,94,0.1)", textColor: "#22c55e", title: "Quantify impact", text: 'Changed "managed team" → "led 12-person team, increasing output by 34%"' },
                    { color: "rgba(99,102,241,0.1)", textColor: "#818cf8", title: "Add Keywords", text: 'Injected "React Native" and "CI/CD" — present in 94% of matching JDs' },
                    { color: "rgba(234,179,8,0.1)", textColor: "#eab308", title: "Remove columns", text: "Multi-column layout detected — ATS reads it as garbled text" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{ background: "#111111", border: "1px solid #1a1a1a" }}
                    >
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{ background: item.color }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: item.textColor }} aria-hidden />
                      </div>
                      <div className="text-[12.5px] leading-snug" style={{ color: "#666666" }}>
                        <strong className="font-semibold text-white">{item.title}</strong> — {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
