"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "What is an ATS score and why does it matter?",
    a: "An ATS (Applicant Tracking System) score measures how well your resume matches a specific job description based on keyword presence, formatting, and structure. Over 98% of Fortune 500 companies use ATS software to filter candidates before a human ever reads the resume. A score below 60 typically means your resume won't reach the hiring manager.",
  },
  {
    q: "Will my resume data be stored?",
    a: "Guest scans (no login) are not stored — your PDF is parsed in memory and discarded immediately. Signed-in users have their resume text and analysis results stored so they can revisit reports. You can delete your data at any time from the Settings page.",
  },
  {
    q: "What types of PDF resumes work best?",
    a: 'Column8 works with any text-based PDF. The most common issue is "scanned" or image-based PDFs (e.g. photographed resumes or locked documents from design tools). If you get a "No readable text" error, export your resume as a text PDF from Google Docs, Word, or Canva.',
  },
  {
    q: "How is the score calculated?",
    a: "The score uses a weighted rubric: 40 pts for keyword match with the JD, 25 pts for experience alignment (years and seniority), 20 pts for demonstrated skills in context, and 15 pts for ATS-safe formatting. This mirrors how enterprise ATS systems like Workday and Greenhouse rank candidates.",
  },
  {
    q: "Are credits one-time or do they expire?",
    a: "Credits are one-time purchases — they never expire and there are no monthly subscriptions. One credit = one full resume analysis. Cover letters and interview simulations do not consume credits.",
  },
  {
    q: "Can I use Column8 for multiple job applications?",
    a: "Absolutely. Each job application needs a tailored analysis since different roles require different keywords. We recommend running a fresh scan for every unique role you apply to — that's why our credits are designed to be bought in bulk.",
  },
] as const;

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className="py-24 md:py-32"
      style={{ background: "#F7F6F2", borderTop: "1px solid #E5E3DC" }}
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#06b6d4" }}>
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display font-bold tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#111111" }}
          >
            Everything you need to know.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#9B9890" }}>
            Still have questions?{" "}
            <a
              href="mailto:support@column8.io"
              className="transition-colors hover:text-cyan-600"
              style={{ color: "#06b6d4" }}
            >
              support@column8.io
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div style={{ borderTop: "1px solid #E5E3DC" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #E5E3DC" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span
                  className="text-sm font-medium leading-snug transition-colors duration-150 group-hover:text-cyan-600"
                  style={{ color: "#111111" }}
                >
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Plus size={14} style={{ color: open === i ? "#06b6d4" : "#C8C4BB", flexShrink: 0 }} aria-hidden />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed" style={{ color: "#6B6860" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
