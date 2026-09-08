"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, SquaresFour as LayoutDashboard, CheckCircle as CheckCircle2, TrendUp as TrendingUp, Lightning as Zap, Check } from "@phosphor-icons/react";
import { MaterialIcon } from "@/components/ui/material-icon";
import DotGrid from "@/app/components/landing/DotGrid";
import HandDrawnUnderline from "@/app/components/landing/HandDrawnUnderline";
import dynamic from "next/dynamic";

const SideRays = dynamic(() => import("@/app/components/ui/SideRays"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const TRUST = [
  "Free analysis, no signup",
  "Unlimited AI mock interviews",
  "Credits never expire",
] as const;

export default function HeroSection({ initialLoggedIn = false }: { initialLoggedIn?: boolean }) {
  const isLoggedIn = initialLoggedIn;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#f9f9fb" }}
      aria-labelledby="hero-heading"
    >
      {/* SideRays - subtle teal from top-right */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <SideRays
          speed={1.2}
          rayColor1="#12a594"
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
          rayColor1="#53b9ab"
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
            background: "radial-gradient(ellipse, rgba(18,165,148,0.07) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Dot-grid texture */}
      <DotGrid size={28} opacity={0.06} className="z-0" />

      {/* ─── Above-fold: fills the viewport ─────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <div className="w-full max-w-4xl flex flex-col items-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-9"
          >
            <span className="block w-7 h-px" style={{ background: "#12a594" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#80838d" }}
            >
              Retrieval-grounded · Voice AI interviews
            </span>
            <span className="block w-7 h-px" style={{ background: "#12a594" }} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-9 font-display font-bold tracking-tight leading-[1.08] text-center"
            style={{ fontSize: "clamp(38px, 6.4vw, 68px)", color: "#1c2024" }}
          >
            <span className="block whitespace-nowrap">Get past the ATS.</span>
            <span className="relative inline-block whitespace-nowrap align-top">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
                className="block pb-[0.08em] text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #008573 0%, #12a594 50%, #53b9ab 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Then ace the interview.
              </motion.span>
              <HandDrawnUnderline
                color="#12a594"
                delay={0.55}
                className="absolute left-0 right-0 -bottom-1.5 w-full h-3"
              />
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
            className="mb-10 max-w-xl text-[17px] leading-[1.65]"
            style={{ color: "#60646c" }}
          >
            Viva scores your resume against the exact job, then turns it into something you
            can question: a copilot that retrieves and cites your real lines instead of
            guessing, and a spoken AI interviewer briefed on the gaps your analysis found.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-14"
          >
            {isLoggedIn ? (
              <>
                <Link href="/upload">
                  <motion.span
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white cursor-pointer"
                    style={{ background: "#12a594", boxShadow: "0 4px 24px rgba(18,165,148,0.32)" }}
                  >
                    <MaterialIcon name="auto_awesome" size={14} />
                    Analyze my resume
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </motion.span>
                </Link>
                <Link href="/dashboard">
                  <motion.span
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-medium cursor-pointer"
                    style={{ background: "#FFFFFF", border: "1px solid #d9d9e0", color: "#60646c" }}
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
                    style={{ background: "#12a594", boxShadow: "0 4px 24px rgba(18,165,148,0.32)" }}
                  >
                    <MaterialIcon name="auto_awesome" size={14} />
                    Analyze my resume - free
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </motion.span>
                </Link>
                <a href="#how-it-works">
                  <motion.span
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center h-12 px-7 rounded-xl text-sm font-medium cursor-pointer"
                    style={{ background: "#FFFFFF", border: "1px solid #d9d9e0", color: "#60646c" }}
                  >
                    See how it works
                  </motion.span>
                </a>
              </>
            )}
          </motion.div>

          {/* Trust row - honest, no invented numbers */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: EASE }}
            className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl px-6 py-3.5"
            style={{ border: "1px solid #d9d9e0", background: "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
          >
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#60646c" }}>
                <Check size={13} weight="bold" style={{ color: "#12a594" }} aria-hidden />
                {t}
              </span>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ─── Below-fold: example report card ─────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 overflow-hidden rounded-2xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid #d9d9e0",
              boxShadow: "0 24px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "#f9f9fb", borderBottom: "1px solid #d9d9e0" }}
            >
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#FECACA" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEF08A" }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#BBF7D0" }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div
                  className="h-5 px-3 rounded-md flex items-center justify-center gap-1.5"
                  style={{ background: "#EBEBEB" }}
                >
                  <span className="text-[9px] font-mono" style={{ color: "#80838d" }}>
                    Resume Match Report · example
                  </span>
                </div>
              </div>
            </div>

            {/* Report content */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-left"
              style={{ background: "#fcfcfd" }}
            >
              {/* ATS Score */}
              <div
                className="col-span-1 flex flex-col items-center justify-center rounded-xl p-6"
                style={{ background: "#FFFFFF", border: "1px solid #d9d9e0" }}
              >
                <div
                  className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#80838d" }}
                >
                  ATS Match Score
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="#f0f0f3" strokeWidth="5" />
                    <motion.circle
                      cx="48" cy="48" r="44"
                      fill="none"
                      stroke="#12a594"
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
                      style={{ color: "#1c2024" }}
                    >
                      92
                    </span>
                    <span className="text-[9px] mt-0.5" style={{ color: "#80838d" }}>/ 100</span>
                  </div>
                </div>
                <div
                  className="mt-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: "rgba(18,165,148,0.1)", color: "#008573" }}
                >
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  up from 68 after fixes
                </div>
              </div>

              {/* AI Suggestions */}
              <div
                className="col-span-1 flex flex-col justify-center rounded-xl p-6 md:col-span-2"
                style={{ background: "#FFFFFF", border: "1px solid #d9d9e0" }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Zap size={12} style={{ color: "#12a594" }} aria-hidden />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#80838d" }}
                  >
                    AI Suggestions
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      bg: "rgba(18,165,148,0.08)",
                      iconColor: "#12a594",
                      title: "Quantify impact",
                      text: 'Rewrote "managed the team" → "led a 12-person team, cutting release time 34%"',
                    },
                    {
                      bg: "rgba(34,197,94,0.08)",
                      iconColor: "#16a34a",
                      title: "Add keywords",
                      text: '"React Native" and "CI/CD" appear in the job description but not your resume',
                    },
                    {
                      bg: "rgba(245,158,11,0.08)",
                      iconColor: "#d97706",
                      title: "Fix layout",
                      text: "Two-column section detected - many ATS parsers read it as scrambled text",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{ background: "#f9f9fb", border: "1px solid #d9d9e0" }}
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
                        style={{ color: "#60646c" }}
                      >
                        <strong className="font-semibold" style={{ color: "#1c2024" }}>
                          {item.title}
                        </strong>{" "}
                        - {item.text}
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
