"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SplitTextReveal } from "./SplitTextReveal";

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
    a: 'ResumAI works with any text-based PDF. The most common issue is "scanned" or image-based PDFs (e.g. photographed resumes or locked documents from some design tools). If you get a "No readable text" error, export your resume as a text PDF from Google Docs, Word, or Canva.',
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
    q: "Can I use ResumAI for multiple job applications?",
    a: "Absolutely. Each job application needs a tailored analysis since different roles require different keywords. We recommend running a fresh scan for every unique role you apply to — that's why our credits are designed to be bought in bulk.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 bg-background" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-14">
          <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-blue-600 dark:text-blue-400 mb-3.5 font-mono">
            FAQ
          </div>
          <h2
            id="faq-heading"
            className="text-[clamp(28px,4vw,44px)] font-bold text-foreground tracking-[-0.02em] leading-[1.12] mb-4"
          >
            <SplitTextReveal>Everything you need to know.</SplitTextReveal>
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            If you don&apos;t see your question here, reach out at{" "}
            <a href="mailto:support@resumai.in" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              support@resumai.in
            </a>
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
          className="divide-y divide-border rounded-2xl border border-border overflow-hidden bg-card/40"
        >
          {FAQS.map((faq, i) => (
            <motion.div 
              key={i}
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors group"
              >
                <span className="text-[14.5px] font-semibold text-foreground leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open === i ? "rotate-180 text-blue-500" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
