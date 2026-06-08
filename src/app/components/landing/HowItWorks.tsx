"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Upload, Cpu, Download, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Resume",
    desc: "Drop your existing PDF. Our parser extracts text and structure in seconds — including complex layouts that ATS systems struggle with.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "AI Analysis",
    desc: "Gemini scores your content against the target job description to surface missing keywords, weak bullets, and formatting issues.",
  },
  {
    num: "03",
    icon: Download,
    title: "Optimize & Export",
    desc: "Apply one-click AI rewrites to your weakest points and download the ATS-ready version. No manual editing required.",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;

const cardVariants: Variants = {
  rest: { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
  hover: { y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.07)", transition: SPRING },
};

const iconVariants: Variants = {
  rest: { scale: 1, background: "rgba(6,182,212,0.08)" },
  hover: { scale: 1.12, background: "rgba(6,182,212,0.16)", transition: SPRING },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32"
      style={{ background: "#F7F6F2", borderTop: "1px solid #E5E3DC" }}
      aria-labelledby="hiw-heading"
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#06b6d4" }}>
            How It Works
          </p>
          <h2
            id="hiw-heading"
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#111111" }}
          >
            From upload to optimized{" "}
            <span style={{ color: "#06b6d4" }}>in 60 seconds.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: EASE }}
              whileHover="hover"
              animate="rest"
              variants={cardVariants}
              className="relative p-8 rounded-2xl cursor-default"
              style={{ background: "#FFFFFF", border: "1px solid #E5E3DC" }}
            >
              <motion.div
                variants={iconVariants}
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                style={{ border: "1px solid rgba(6,182,212,0.2)" }}
              >
                <step.icon size={18} style={{ color: "#06b6d4" }} strokeWidth={1.5} aria-hidden />
              </motion.div>

              <div className="text-[10px] font-mono mb-3" style={{ color: "#C8C4BB" }}>
                Step {step.num}
              </div>

              <h3 className="text-base font-semibold mb-3" style={{ color: "#111111" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B6860" }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center"
        >
          <Link
            href="/try"
            className="group inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-cyan-600"
            style={{ color: "#6B6860" }}
          >
            Start optimizing now
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
