"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, LayoutDashboard, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import SplitText from "@/app/components/ui/SplitText";
import dynamic from "next/dynamic";

const SideRays = dynamic(() => import("@/app/components/ui/SideRays"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const STATS = [
  ["10,000+", "Resumes Scored"],
  ["94%",     "ATS Pass Rate"],
  ["< 60s",   "Analysis Time"],
] as const;

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
      className="relative w-full overflow-hidden"
      style={{ background: "#F7F6F2" }}
      aria-labelledby="hero-heading"
    >
      {/* SideRays — subtle cyan from top-right */}
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

      {/* SideRays from top-left */}
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

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ─── Above-fold: fills the viewport ─────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <div className="w-full max-w-3xl flex flex-col items-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-9"
          >
            <span className="block w-7 h-px" style={{ background: "#06b6d4" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#9B9890" }}
            >
              AI Resume Optimization
            </span>
            <span className="block w-7 h-px" style={{ background: "#06b6d4" }} />
          </motion.div>

          {/* Headline */}
          <div className="mb-7">
            <SplitText
              text="Turn job descriptions"
              tag="h1"
              id="hero-heading"
              splitType="chars"
              delay={18}
              duration={0.52}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.2}
              textAlign="center"
              className="font-display font-bold tracking-tight leading-[1.06] block"
              style={{ fontSize: "clamp(42px, 7vw, 76px)", color: "#111111" }}
            />
            <SplitText
              text="into interview invites."
              tag="span"
              splitType="chars"
              delay={18}
              duration={0.52}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.2}
              textAlign="center"
              className="font-display font-bold tracking-tight leading-[1.06] block text-transparent bg-clip-text"
              style={{
                fontSize: "clamp(42px, 7vw, 76px)",
                backgroundImage: "linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            />
          </div>

          {/* Subhead — static, confident */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
            className="mb-10 max-w-md text-[17px] leading-[1.65]"
            style={{ color: "#6B6860" }}
          >
            Know your ATS score in 60 seconds. Get specific rewrites, fill keyword gaps, and walk into every interview prepared.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-14"
          >
            {mounted && isLoggedIn ? (
              <>
                <Link href="/upload">
                  <motion.span
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white cursor-pointer"
                    style={{ background: "#06b6d4", boxShadow: "0 4px 24px rgba(6,182,212,0.32)" }}
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
                    style={{ background: "#06b6d4", boxShadow: "0 4px 24px rgba(6,182,212,0.32)" }}
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

          {/* Stats — unified card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: EASE }}
          >
            <div
              className="inline-flex items-stretch rounded-2xl overflow-hidden"
              style={{
                border: "1px solid #E5E3DC",
                background: "#FFFFFF",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              {STATS.map(([stat, label], i) => (
                <div
                  key={label}
                  className="flex flex-col items-center px-8 py-5"
                  style={i < STATS.length - 1 ? { borderRight: "1px solid #E5E3DC" } : undefined}
                >
                  <span
                    className="text-xl font-bold font-mono tabular-nums leading-none"
                    style={{ color: "#111111" }}
                  >
                    {stat}
                  </span>
                  <span
                    className="mt-1.5 text-[11px] whitespace-nowrap"
                    style={{ color: "#9B9890" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ─── Below-fold: report card ──────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
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
                <div
                  className="h-5 w-48 rounded-md flex items-center justify-center"
                  style={{ background: "#EBEBEB" }}
                >
                  <span className="text-[9px] font-mono" style={{ color: "#9B9890" }}>
                    column8.io/dashboard/report
                  </span>
                </div>
              </div>
            </div>

            {/* Report content */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-left"
              style={{ background: "#FAFAF8" }}
            >
              {/* ATS Score */}
              <div
                className="col-span-1 flex flex-col items-center justify-center rounded-xl p-6"
                style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
              >
                <div
                  className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#9B9890" }}
                >
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
                      whileInView={{ strokeDashoffset: 22 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className="text-3xl font-bold font-mono leading-none"
                      style={{ color: "#111111" }}
                    >
                      92
                    </span>
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
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#9B9890" }}
                  >
                    AI Suggestions
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      bg: "rgba(6,182,212,0.08)",
                      iconColor: "#06b6d4",
                      title: "Quantify impact",
                      text: 'Changed "managed team" → "led 12-person team, increasing output by 34%"',
                    },
                    {
                      bg: "rgba(34,197,94,0.08)",
                      iconColor: "#16a34a",
                      title: "Add Keywords",
                      text: 'Injected "React Native" and "CI/CD" — present in 94% of matching JDs',
                    },
                    {
                      bg: "rgba(245,158,11,0.08)",
                      iconColor: "#d97706",
                      title: "Remove columns",
                      text: "Multi-column layout detected — ATS reads it as garbled text",
                    },
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
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          style={{ color: item.iconColor }}
                          aria-hidden
                        />
                      </div>
                      <div
                        className="text-[12.5px] leading-snug"
                        style={{ color: "#6B6860" }}
                      >
                        <strong className="font-semibold" style={{ color: "#111111" }}>
                          {item.title}
                        </strong>{" "}
                        — {item.text}
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
