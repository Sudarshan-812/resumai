"use client";

import type { FC, JSX } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, TrendingUp, LayoutDashboard, Zap, Star } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const STATS = [
  { value: "2,400+", label: "Resumes Analyzed" },
  { value: "89%",    label: "Avg Score Improvement" },
  { value: "10 sec", label: "Average Analysis Time" },
];

const HeroSection: FC = (): JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <section
      className="relative flex min-h-[96vh] w-full flex-col items-center justify-center overflow-hidden bg-background pt-28 pb-16"
      aria-labelledby="hero-heading"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-5xl px-4 text-center">

        {/* Social proof badge */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mb-8 w-fit">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">
              <span className="font-bold text-foreground">2,400+</span> job seekers improved their resume
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          id="hero-heading"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.08 }}
          className="pb-3 text-[clamp(40px,7vw,80px)] font-bold leading-[1.04] tracking-[-0.03em] text-foreground"
        >
          Beat the ATS Filter.{" "}
          <br className="hidden sm:block" />
          <span className="text-blue-600 dark:text-blue-400">
            Land the Interview.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.16 }}
          className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground"
        >
          Upload your resume, paste a job description, and get a detailed ATS score with
          AI-powered rewrites — in under 10 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.24 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {mounted && isLoggedIn ? (
            <>
              <Link href="/upload" aria-label="Analyze your resume">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group h-12 flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  Analyze My Resume
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </motion.div>
              </Link>
              <Link href="/dashboard" aria-label="Go to your dashboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-8 text-sm font-semibold text-foreground hover:bg-muted/60 cursor-pointer transition-colors backdrop-blur-sm"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Go to Dashboard
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/try" aria-label="Try free without signing up">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group h-12 flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  Try Free — No Login
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </motion.div>
              </Link>
              <Link href="/login" aria-label="Create a free account">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-8 text-sm font-semibold text-foreground hover:bg-muted/60 cursor-pointer transition-colors backdrop-blur-sm"
                >
                  Create Free Account
                </motion.div>
              </Link>
            </>
          )}
        </motion.div>

        {/* Microcopy */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.32 }}
          className="mt-4 text-[12px] text-muted-foreground"
        >
          {mounted && isLoggedIn
            ? "AI-powered analysis · Instant results · Free to use"
            : "No credit card required · 3 free scans · Results in ~10 seconds"
          }
        </motion.p>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-12 mb-2 grid grid-cols-3 gap-px bg-border/50 rounded-2xl border border-border overflow-hidden max-w-lg shadow-sm"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-4 px-3 bg-card/80 backdrop-blur-sm">
              <span className="text-xl font-bold tracking-tight text-foreground font-mono">{s.value}</span>
              <span className="mt-0.5 text-[10px] font-medium text-muted-foreground text-center leading-tight">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 w-full max-w-4xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl shadow-zinc-900/10 backdrop-blur-md"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-5 w-48 rounded-md bg-muted/60 flex items-center justify-center">
                <span className="text-[9px] font-mono text-muted-foreground">resumai.in/dashboard/report</span>
              </div>
            </div>
          </div>

          {/* Report mockup */}
          <div className="grid grid-cols-1 gap-5 p-6 text-left md:grid-cols-3">

            {/* ATS Score */}
            <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-border bg-background/60 p-6">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                ATS Match Score
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="48" cy="48" r="44" className="fill-none stroke-muted stroke-[5]" />
                  <motion.circle
                    cx="48" cy="48" r="44"
                    className="fill-none stroke-emerald-500 stroke-[5] stroke-linecap-round"
                    strokeDasharray="276"
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 22 }}
                    transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground font-mono leading-none">92</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">/ 100</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                +24 pts after optimize
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="col-span-1 flex flex-col justify-center rounded-xl border border-border bg-background/60 p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Zap size={12} className="text-blue-500" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  AI Suggestions
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    color: "bg-emerald-500/10 text-emerald-500",
                    title: "Quantify impact",
                    text: 'Changed "managed team" → "led 12-person team, increasing output by 34%"',
                  },
                  {
                    color: "bg-blue-500/10 text-blue-500",
                    title: "Add Keywords",
                    text: 'Injected "React Native" and "CI/CD" — present in 94% of matching JDs',
                  },
                  {
                    color: "bg-amber-500/10 text-amber-500",
                    title: "Remove columns",
                    text: "Multi-column layout detected — ATS reads it as garbled text",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${item.color}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div className="text-[12.5px] leading-snug text-muted-foreground">
                      <strong className="font-semibold text-foreground">{item.title}</strong> — {item.text}
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
};

export default HeroSection;
