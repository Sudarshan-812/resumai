"use client";

import { motion, type Variants } from "framer-motion";
import { BarChart3, Wand2, Mic, FileText, History } from "lucide-react";

const FEATURES = [
  {
    num: "01",
    icon: BarChart3,
    title: "ATS Scorer",
    desc: "Precise keyword match score against any job description — mirroring how Workday and Greenhouse rank candidates before a human ever reads your resume.",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Bullet Rewriter",
    desc: "Our AI identifies your 5 weakest bullet points and rewrites each one with action verbs, quantified impact, and the exact language hiring managers look for.",
  },
  {
    num: "03",
    icon: Mic,
    title: "Voice Interview",
    desc: "Practice with a real-time AI interviewer trained on your resume and the target JD. Powered by LiveKit WebRTC and Groq Llama 3.3 for sub-second responses.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Cover Letter Generator",
    desc: "Generate role-specific cover letters mapped directly to the job description. Not template-generic — each one references your actual experience.",
  },
  {
    num: "05",
    icon: History,
    title: "Resume Versions",
    desc: "Track every analysis and compare scores across iterations as you optimize for different roles. See your improvement over time.",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;

const rowVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 6, transition: SPRING },
};

const numVariants: Variants = {
  rest: { color: "#C8C4BB" },
  hover: { color: "#06b6d4", transition: { duration: 0.18 } },
};

const iconBgVariants: Variants = {
  rest: { scale: 1, background: "rgba(6,182,212,0.08)" },
  hover: { scale: 1.14, background: "rgba(6,182,212,0.18)", transition: SPRING },
};

const titleVariants: Variants = {
  rest: { color: "#111111" },
  hover: { color: "#0891b2", transition: { duration: 0.18 } },
};

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="py-24 md:py-32"
      style={{ background: "#FFFFFF", borderTop: "1px solid #E5E3DC" }}
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono"
            style={{ color: "#06b6d4" }}
          >
            Platform Capabilities
          </p>
          <h2
            className="font-display font-bold tracking-tight leading-tight max-w-lg"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#111111" }}
          >
            Five tools. One goal:{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #0891b2, #06b6d4)" }}
            >
              get the interview.
            </span>
          </h2>
        </div>

        {/* Numbered list — Framer Motion parent variant hover propagation */}
        <div style={{ borderTop: "1px solid #E5E3DC" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: EASE }}
              whileHover="hover"
              animate="rest"
              variants={rowVariants}
              className="flex items-start gap-6 md:gap-10 py-7 cursor-default"
              style={{ borderBottom: "1px solid #E5E3DC" }}
            >
              {/* Number */}
              <motion.span
                variants={numVariants}
                className="text-xs font-mono shrink-0 mt-0.5 w-5 tabular-nums"
              >
                {f.num}
              </motion.span>

              {/* Icon */}
              <motion.div
                variants={iconBgVariants}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ border: "1px solid rgba(6,182,212,0.2)" }}
              >
                <f.icon size={15} style={{ color: "#06b6d4" }} strokeWidth={1.5} aria-hidden />
              </motion.div>

              {/* Content */}
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-12">
                <motion.h3
                  variants={titleVariants}
                  className="text-sm font-semibold shrink-0 min-w-[160px]"
                >
                  {f.title}
                </motion.h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6860" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
