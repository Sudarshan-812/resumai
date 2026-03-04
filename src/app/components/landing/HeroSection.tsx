"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Upload, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

const floatLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    y: [0, -10, 0],
    transition: {
      y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

const floatRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    y: [0, 15, 0],
    transition: {
      y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

const TRUSTED_COMPANIES: readonly string[] = [
  "Google",
  "Microsoft",
  "Amazon",
  "Spotify",
  "Netflix",
];

const HeroSection: FC = (): JSX.Element => {
  return (
    <section
      // Background: #0F172A (Slate 900)
      className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden bg-[#0F172A] pt-32 pb-20"
      aria-labelledby="hero-heading"
    >
      {/* --- Technical Grid Background --- */}
      <div 
        className="absolute inset-0 z-0 opacity-30" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', 
          backgroundSize: '4rem 4rem' 
        }} 
      />
      
      {/* --- Spotlight Vignette --- */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0F172A_100%)]" 
      />

      {/* --- Ambient Indigo Glow --- */}
      <div
        aria-hidden="true"
        className="absolute top-[-20%] left-[50%] h-[600px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-[#6366F1] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 max-w-5xl px-4 text-center">
        
        {/* --- Badge --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-8 w-fit"
        >
          <div className="group flex items-center gap-2 rounded-full border border-[#6366F1]/30 bg-[#1e293b]/60 px-4 py-1.5 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-200">
              Powered by <span className="text-[#818cf8]">Gemini 2.0 Flash</span>
            </span>
          </div>
        </motion.div>

        {/* --- Heading --- */}
        <motion.h1
          id="hero-heading"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="pb-6 text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Craft Your Perfect <br />
          <span className="bg-gradient-to-r from-[#6366F1] via-[#818cf8] to-[#6366F1] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            Resume with AI.
          </span>
        </motion.h1>

        {/* --- Description --- */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-400 md:text-xl"
        >
          Stop guessing keywords. We use <span className="text-slate-200 font-medium">Google&apos;s advanced AI</span> to analyze your
          resume against job descriptions and boost your interview chances by
          3x.
        </motion.p>

        {/* --- CTA Buttons --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/login" aria-label="Build resume for free">
            <Button
              size="lg"
              // Primary: #6366F1 -> Hover: #4F46E5
              className="relative h-14 overflow-hidden rounded-full bg-[#6366F1] px-8 text-base font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all hover:bg-[#4F46E5] hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]"
            >
              Build My Resume Free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>

          <Link 
            href="https://youtu.be/6-LzPphsGh8" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Watch demo video"
          >
            <Button
              size="lg"
              className="h-14 rounded-full border border-slate-700 bg-slate-800/50 px-8 text-base font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white hover:border-slate-600"
            >
              <Play className="mr-2 h-5 w-5 fill-slate-300 transition-colors group-hover:fill-white" aria-hidden="true" />
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        {/* --- Social Proof --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 border-t border-slate-800 pt-10"
        >
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Trusted by engineers at
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            {TRUSTED_COMPANIES.map((company) => (
              <span
                key={company}
                className="text-xl font-bold text-slate-300"
              >
                {company}
              </span>
            ))}
          </div>
        </motion.div>

        {/* --- Floating UI Element: Parsing Status --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={floatLeft}
          transition={{ delay: 0.6 }}
          className="absolute top-1/3 -left-16 z-20 hidden w-72 items-center gap-4 rounded-xl border border-slate-700 bg-[#1e293b]/80 p-4 shadow-2xl backdrop-blur-xl lg:flex"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
            {/* Success: #10B981 */}
            <Upload className="h-6 w-6 text-[#10B981]" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-medium text-slate-400">Status</p>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-slate-100">Parsing PDF...</p>
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </div>
            </div>
             {/* Progress Bar */}
             <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full rounded-full bg-[#10B981]"
                />
            </div>
          </div>
        </motion.div>

        {/* --- Floating UI Element: ATS Score --- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={floatRight}
          transition={{ delay: 0.7 }}
          className="absolute bottom-1/4 -right-16 z-20 hidden items-center gap-4 rounded-xl border border-slate-700 bg-[#1e293b]/80 p-4 shadow-2xl backdrop-blur-xl lg:flex"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20">
            <FileText className="h-6 w-6 text-[#6366F1]" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-400">ATS Score</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-white font-mono">92</p>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
          </div>
          <div className="rounded-md border border-[#10B981]/20 bg-[#10B981]/10 px-2 py-1 text-xs font-bold text-[#10B981]">
            Excellent
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;