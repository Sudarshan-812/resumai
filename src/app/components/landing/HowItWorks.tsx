"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32"
      style={{ background: "#0A0A0A", borderTop: "1px solid #161616" }}
      aria-labelledby="hiw-heading"
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#6366f1" }}>
            How It Works
          </p>
          <h2
            id="hiw-heading"
            className="font-bold text-white tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            From upload to optimized in 60 seconds.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {/* Connector line — desktop only */}
          <div
            aria-hidden
            className="absolute hidden md:block"
            style={{ top: "40px", left: "calc(33.33% + 20px)", right: "calc(33.33% + 20px)", height: "1px", background: "linear-gradient(90deg, #222222, #333333, #222222)" }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-8 rounded-2xl group"
              style={{ background: "#111111", border: "1px solid #1a1a1a" }}
            >
              {/* Step number badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 relative z-10 transition-all duration-200 group-hover:border-indigo-500/40"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
              >
                <step.icon size={18} style={{ color: "#6366f1" }} strokeWidth={1.5} aria-hidden />
              </div>

              <div
                className="text-[10px] font-mono mb-3"
                style={{ color: "#333333" }}
              >
                Step {step.num}
              </div>

              <h3 className="text-base font-semibold text-white mb-3 group-hover:text-indigo-400 transition-colors duration-200">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#555555" }}>
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
            className="group inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400"
            style={{ color: "#888888" }}
          >
            Start optimizing now
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
