"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  },
};

const HeroSection: FC = (): JSX.Element => {
  return (
    <section
      className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden bg-background pt-32 pb-20"
      aria-labelledby="hero-heading"
    >
      {/* Subtle Hairline Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* Spotlight Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(circle at center, transparent 0%, var(--color-background) 100%)' }}
      />

      {/* Ambient Primary Glow */}
      <div
        aria-hidden="true"
        className="absolute top-[-20%] left-[50%] h-[600px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-primary opacity-10 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-5xl px-4 text-center">

        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-8 w-fit"
        >
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground tracking-wide">
              Powered by <span className="font-semibold text-primary">Gemini 2.5 Flash</span>
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          id="hero-heading"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="pb-6 text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl"
        >
          Craft Your Perfect <br className="hidden sm:block" />
          <span className="text-primary">
            Resume with AI.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-2 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Stop guessing keywords. We use Google&apos;s advanced AI to analyze your
          resume against job descriptions and boost your interview chances.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary: Try Free */}
          <Link href="/try" aria-label="Try free without signing up">
            <motion.div
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="group relative h-12 flex items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98] transition-colors overflow-hidden cursor-pointer"
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                animate={{ x: ["-150%", "150%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
              <span className="relative z-10">Try Free — No Login</span>
              <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </motion.div>
          </Link>

          {/* Secondary: Sign up */}
          <Link href="/login" aria-label="Create an account">
            <Button
              size="lg"
              variant="outline"
              className="group h-12 rounded-xl border-border bg-card/50 px-8 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/50 active:scale-[0.98]"
            >
              <Play className="mr-2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
              Sign Up Free
            </Button>
          </Link>
        </motion.div>

        {/* Social proof nudge */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          3 free scans · No credit card · Results in ~10 seconds
        </motion.p>

        {/* Visual Anchor (Analysis Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="mx-auto mt-20 w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card/40 shadow-2xl backdrop-blur-md"
        >
          {/* Mockup Header */}
          <div className="flex items-center border-b border-border bg-muted/20 px-4 py-3">
            <div className="flex gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="ml-4 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
              Analysis_Report.pdf
            </div>
          </div>

          {/* Mockup Body */}
          <div className="grid grid-cols-1 gap-6 p-6 text-left md:grid-cols-3">

            {/* Left: ATS Score Ring */}
            <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-border bg-background/50 p-6">
              <div className="mb-4 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                ATS Match Score
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="48" cy="48" r="44" className="fill-none stroke-muted stroke-[5]" />
                  <motion.circle
                    cx="48" cy="48" r="44"
                    className="fill-none stroke-emerald-500 stroke-[5] stroke-linecap-round"
                    strokeDasharray="276"
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 22 }}
                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold text-foreground font-mono tracking-tighter">92</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> +24 pts optimized
              </div>
            </div>

            {/* Right: AI Suggestions Feed */}
            <div className="col-span-1 flex flex-col justify-center rounded-xl border border-border bg-background/50 p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  AI Suggestions
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm leading-snug text-muted-foreground">
                    <strong className="font-medium text-foreground">Quantify impact</strong> — changed "managed team" to "led 12-person engineering team, increasing output by 34%"
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm leading-snug text-muted-foreground">
                    <strong className="font-medium text-foreground">Add Keywords</strong> — injected "React Native" and "CI/CD", which appear in 94% of matching job descriptions.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
