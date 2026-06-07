"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, LayoutDashboard, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import SplitText from "@/app/components/ui/SplitText";
import TextType from "@/app/components/ui/TextType";
import dynamic from "next/dynamic";

// SideRays uses WebGL — dynamic import prevents SSR
const SideRays = dynamic(() => import("@/app/components/ui/SideRays"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

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
      style={{ background: "#F7F6F2" }}
      aria-labelledby="hero-heading"
    >
      {/* SideRays — subtle cyan rays from top-right */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <SideRays
          speed={1.2}
          rayColor1="#06b6d4"
          rayColor2="#A5F3FC"
          intensity={1.4}
          spread={2.2}
          origin="top-right"
          tilt={0}
          saturation={0.9}
          blend={0.7}
          falloff={1.8}
          opacity={0.38}
        />
      </div>

      {/* Additional SideRays from top-left for symmetry */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <SideRays
          speed={1.5}
          rayColor1="#22d3ee"
          rayColor2="#CFFAFE"
          intensity={1.2}
          spread={1.8}
          origin="top-left"
          tilt={0}
          saturation={0.7}
          blend={0.6}
          falloff={2.0}
          opacity={0.22}
        />
      </div>

      {/* Radial glow underneath */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 65%)",
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
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.25)",
              color: "#0891b2",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#06b6d4" }} />
            <Mic size={11} aria-hidden />
            Voice AI Interview — Now Live
          </div>
        </motion.div>

        {/* Headline — SplitText animated by char */}
        <div className="mb-6">
          <SplitText
            text="Land more interviews."
            tag="h1"
            id="hero-heading"
            splitType="chars"
            delay={20}
            duration={0.55}
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            textAlign="center"
            className="font-display font-bold tracking-tight leading-[1.08] block"
            style={{ fontSize: "clamp(38px, 6.5vw, 68px)", color: "#111111" }}
          />
          <SplitText
            text="Beat the ATS filter."
            tag="span"
            splitType="chars"
            delay={20}
            duration={0.55}
            from={{ opacity: 0, y: 28 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            textAlign="center"
            className="font-display font-bold tracking-tight leading-[1.08] block text-transparent bg-clip-text"
            style={{
              fontSize: "clamp(38px, 6.5vw, 68px)",
              backgroundImage: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
        </div>

        {/* Subhead — TextType cycling phrases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="mb-10 max-w-xl mx-auto"
        >
          <div className="text-lg leading-relaxed" style={{ color: "#6B6860" }}>
            <TextType
              as="span"
              text={[
                "AI-powered ATS score in under 60 seconds.",
                "Specific resume rewrites for each job.",
                "Live voice interview practice with AI.",
                "Land your dream role faster.",
              ]}
              typingSpeed={42}
              deletingSpeed={22}
              pauseDuration={2200}
              showCursor
              cursorCharacter="_"
              cursorClassName="font-light"
              className="font-normal"
              style={{ color: "#6B6860" }}
            />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          {mounted && isLoggedIn ? (
            <>
              <Link href="/upload">
                <motion.span
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{ background: "#06b6d4", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}
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
                  style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", color: "#6B6860" }}
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
                  style={{ background: "#06b6d4", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}
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
                  style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", color: "#6B6860" }}
                >
                  Create Account
                </motion.span>
              </Link>
            </>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center gap-12 flex-wrap mb-20"
        >
          {[
            ["10,000+", "Resumes Scored"],
            ["94%",     "ATS Pass Rate"],
            ["< 60s",   "Analysis Time"],
          ].map(([stat, label]) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-2xl font-bold font-mono" style={{ color: "#111111" }}>{stat}</span>
              <span className="text-xs mt-1" style={{ color: "#9B9890" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.9, ease: EASE }}
          className="mx-auto w-full max-w-4xl"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-2xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E3DC",
              boxShadow: "0 24px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "#F7F6F2", borderBottom: "1px solid #E5E3DC" }}
            >
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#FECACA" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEF08A" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#BBF7D0" }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-48 rounded-md flex items-center justify-center" style={{ background: "#EBEBEB" }}>
                  <span className="text-[9px] font-mono" style={{ color: "#9B9890" }}>column8.io/dashboard/report</span>
                </div>
              </div>
            </div>

            {/* Report content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-left" style={{ background: "#FAFAF8" }}>
              {/* ATS Score */}
              <div
                className="col-span-1 flex flex-col items-center justify-center rounded-xl p-6"
                style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
              >
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9B9890" }}>
                  ATS Match Score
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="#F0EFE9" strokeWidth="5" />
                    <motion.circle
                      cx="48" cy="48" r="44"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="276"
                      initial={{ strokeDashoffset: 276 }}
                      animate={{ strokeDashoffset: 22 }}
                      transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold font-mono leading-none" style={{ color: "#111111" }}>92</span>
                    <span className="text-[9px] mt-0.5" style={{ color: "#9B9890" }}>/ 100</span>
                  </div>
                </div>
                <div
                  className="mt-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: "rgba(6,182,212,0.1)", color: "#0891b2" }}
                >
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  +24 pts after optimize
                </div>
              </div>

              {/* AI Suggestions */}
              <div
                className="col-span-1 flex flex-col justify-center rounded-xl p-6 md:col-span-2"
                style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Zap size={12} style={{ color: "#06b6d4" }} aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9B9890" }}>
                    AI Suggestions
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { bg: "rgba(6,182,212,0.08)", iconColor: "#06b6d4", title: "Quantify impact", text: 'Changed "managed team" → "led 12-person team, increasing output by 34%"' },
                    { bg: "rgba(34,197,94,0.08)",  iconColor: "#16a34a", title: "Add Keywords",    text: 'Injected "React Native" and "CI/CD" — present in 94% of matching JDs' },
                    { bg: "rgba(245,158,11,0.08)", iconColor: "#d97706", title: "Remove columns",  text: "Multi-column layout detected — ATS reads it as garbled text" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
                    >
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{ background: item.bg }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: item.iconColor }} aria-hidden />
                      </div>
                      <div className="text-[12.5px] leading-snug" style={{ color: "#6B6860" }}>
                        <strong className="font-semibold" style={{ color: "#111111" }}>{item.title}</strong> — {item.text}
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
