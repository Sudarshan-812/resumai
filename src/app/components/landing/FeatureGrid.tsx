"use client";

import { motion, type Variants } from "framer-motion";
import { ChartBar as BarChart3, MagicWand as Wand2, Microphone as Mic, FileText, ClockCounterClockwise as History, ChatCircleText as ChatCircle } from "@phosphor-icons/react";
import DotGrid from "@/app/components/landing/DotGrid";

const FEATURES = [
  {
    num: "01",
    icon: Mic,
    title: "Voice Mock Interview",
    flagship: true,
    desc: "A real spoken interview over WebRTC. The interviewer is briefed on your ATS analysis - your score, your gaps, the sections that matter for this job - and runs a phased plan with pointed follow-ups on every vague answer. You get a scored summary, saved to your history. Free and unlimited.",
    tags: ["Spoken", "Briefed on your analysis"],
  },
  {
    num: "02",
    icon: ChatCircle,
    title: "Grounded Resume Copilot",
    flagship: false,
    desc: "Chat with your resume. Hybrid search (semantic + keyword) pulls the sections that matter, an LLM re-ranks them, and every answer cites what it's quoting as [S1], [S2]. It coaches from your real lines - and says \"I don't see that\" instead of inventing experience.",
    tags: ["Hybrid retrieval", "Cited answers"],
  },
  {
    num: "03",
    icon: BarChart3,
    title: "ATS Match Score",
    flagship: false,
    desc: "A precise keyword-match score against the exact job description - the same signals Workday and Greenhouse use to rank you before a person ever reads your resume.",
    tags: ["Keyword match", "Formatting check"],
  },
  {
    num: "04",
    icon: Wand2,
    title: "Bullet Rewrites",
    flagship: false,
    desc: "Viva flags your weakest bullet points and rewrites them with strong verbs, real numbers, and the language the job description is actually asking for.",
    tags: ["Action verbs", "Quantified impact"],
  },
  {
    num: "05",
    icon: FileText,
    title: "Cover Letter Generator",
    flagship: false,
    desc: "Role-specific cover letters mapped to the job description - each one references your actual experience instead of reading like a template.",
    tags: ["Role-specific", "Job-mapped"],
  },
  {
    num: "06",
    icon: History,
    title: "Reports & Interview History",
    flagship: false,
    desc: "Every analysis and every mock interview is saved. Compare scores across rewrites and roles, and pick up the question you were told to re-practise.",
    tags: ["Version tracking", "Interview history"],
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;

const rowVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 6, transition: SPRING },
};

const numVariants: Variants = {
  rest: { color: "#80838d" },
  hover: { color: "#12a594", transition: { duration: 0.18 } },
};

const iconBgVariants: Variants = {
  rest: { scale: 1, background: "rgba(18,165,148,0.08)" },
  hover: { scale: 1.14, background: "rgba(18,165,148,0.18)", transition: SPRING },
};

const titleVariants: Variants = {
  rest: { color: "#1c2024" },
  hover: { color: "#008573", transition: { duration: 0.18 } },
};

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative py-24 md:py-32 overflow-hidden scroll-mt-24"
      style={{ background: "#FFFFFF", borderTop: "1px solid #d9d9e0" }}
    >
      <DotGrid size={28} opacity={0.05} />
      <div className="relative max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono"
            style={{ color: "#12a594" }}
          >
            What&apos;s inside
          </p>
          <h2
            className="font-display font-bold tracking-tight leading-tight max-w-lg"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#1c2024" }}
          >
            One workflow, from applying{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #008573, #12a594)" }}
            >
              to the interview.
            </span>
          </h2>
        </div>

        {/* Numbered list - Framer Motion parent variant hover propagation */}
        <div style={{ borderTop: "1px solid #d9d9e0" }}>
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
              style={{ borderBottom: "1px solid #d9d9e0" }}
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
                style={{ border: "1px solid rgba(18,165,148,0.2)" }}
              >
                <f.icon size={15} style={{ color: "#12a594" }} aria-hidden />
              </motion.div>

              {/* Content */}
              <div className="flex-1 flex flex-col md:flex-row md:items-start gap-3 md:gap-12">
                <div className="shrink-0 min-w-[160px] md:pt-0.5">
                  <motion.h3
                    variants={titleVariants}
                    className="text-sm font-semibold"
                  >
                    {f.title}
                  </motion.h3>
                  {f.flagship && (
                    <span
                      className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                      style={{ background: "#12a594", color: "#FFFFFF" }}
                    >
                      Flagship
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed" style={{ color: "#60646c" }}>
                    {f.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          background: "rgba(18,165,148,0.06)",
                          border: "1px solid rgba(18,165,148,0.18)",
                          color: "#008573",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
