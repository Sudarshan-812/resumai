'use client';

import React from 'react';
import {
  FileText,
  BarChart3,
  UploadCloud,
  Wand2
} from 'lucide-react';
import { SplitTextReveal } from './SplitTextReveal';
import { motion } from 'framer-motion';

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-background border-y border-border"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="mb-16">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-primary mb-3.5 font-mono">
            Platform Capabilities
          </div>
          <h2 className="font-serif text-[clamp(30px,4vw,48px)] text-foreground tracking-[-0.02em] leading-[1.12] max-w-[560px] mb-4">
            <SplitTextReveal>Everything you need to beat the filter and land the interview.</SplitTextReveal>
          </h2>
          <p className="text-base text-muted-foreground max-w-[480px] leading-[1.65]">
            Four core tools working in concert — so every application you send is optimized before it reaches a human.
          </p>
        </div>

        {/* BENTO GRID */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } }, hidden: {} }}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-2xl overflow-hidden shadow-sm"
        >

          {/* FEATURE 1: ATS SCORE */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
            className="group relative bg-card hover:bg-muted/50 transition-colors duration-200 p-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <BarChart3 strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-card-foreground mb-2 tracking-[-0.01em]">
              Instant ATS Score
            </h3>
            <p className="text-sm text-muted-foreground leading-[1.6]">
              See exactly how applicant tracking systems parse and rank your resume before a recruiter ever reads it.
            </p>
          </motion.div>

          {/* FEATURE 2: COVER LETTERS */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
            className="group relative bg-card hover:bg-muted/50 transition-colors duration-200 p-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <FileText strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-card-foreground mb-2 tracking-[-0.01em]">
              Contextual Cover Letters
            </h3>
            <p className="text-sm text-muted-foreground leading-[1.6]">
              Generate tailored cover letters mapped directly to any job description. Role-specific, not template-generic.
            </p>
          </motion.div>

          {/* FEATURE 3: PDF PARSING (Full Width) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
            className="group relative bg-card hover:bg-muted/50 transition-colors duration-200 p-10 md:col-span-2 overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <UploadCloud strokeWidth={1.75} className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-card-foreground mb-2 tracking-[-0.01em]">
                Flawless PDF Parsing
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.6] max-w-lg">
                Stop worrying about complex columns and hidden tables. Our parser extracts text and structure from your PDF exactly how enterprise ATS systems do it.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-end opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <div className="border border-border rounded-lg p-4 bg-background shadow-sm w-full max-w-xs">
                <div className="h-2 w-1/3 bg-muted-foreground/30 rounded mb-3"></div>
                <div className="h-2 w-full bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 w-4/6 bg-muted-foreground/30 rounded"></div>
              </div>
            </div>
          </motion.div>

          {/* FEATURE 4: SMART REWRITES (Full Width) */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
            className="group relative bg-card hover:bg-muted/50 transition-colors duration-200 p-10 md:col-span-2 overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Wand2 strokeWidth={1.75} className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-card-foreground mb-2 tracking-[-0.01em]">
                Gemini-Powered Smart Rewrites
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.6] max-w-lg">
                Identify missing skills and let Gemini 2.5 rewrite weak bullet points using action verbs, metrics, and impact language that hiring managers notice.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-end opacity-50 group-hover:opacity-100 transition-opacity duration-300">
              <div className="border border-border rounded-lg p-4 bg-background shadow-sm w-full max-w-xs relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Refactoring...
                </div>
                <div className="h-2 w-full bg-primary/20 rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-primary/20 rounded"></div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
