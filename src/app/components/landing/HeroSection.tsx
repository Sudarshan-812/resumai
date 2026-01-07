"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Upload, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const floatLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    y: [0, -10, 0],
    transition: {
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

const floatRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    y: [0, 15, 0],
    transition: {
      y: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

const TRUSTED_COMPANIES: readonly string[] = [
  "Google",
  "Microsoft",
  "Amazon",
  "Spotify",
  "Netflix",
];

const HeroSection: FC = (): JSX.Element => {
  return (
    <section
      className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-white pb-20 pt-32"
      aria-labelledby="hero-heading"
    >
      <div
        aria-hidden="true"
        className="absolute left-[20%] top-[-20%] h-[600px] w-[600px] rounded-full bg-purple-200/40 blur-[120px] mix-blend-multiply animate-pulse"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-20%] right-[20%] h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[120px] mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-5xl px-4 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-8 w-fit rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-2 shadow-sm backdrop-blur-sm"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <Sparkles className="h-4 w-4 fill-indigo-700" aria-hidden="true" />
            Powered by Gemini 2.0 Flash
          </span>
        </motion.div>

        <motion.h1
          id="hero-heading"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="pb-6 text-6xl font-extrabold leading-[1.1] tracking-tighter text-gray-900 md:text-8xl"
        >
          Craft Your Perfect <br />
          <span className="animate-gradient-x bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Resume with AI.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-3xl text-xl font-medium leading-relaxed text-gray-600 md:text-2xl"
        >
          Stop guessing keywords. We use Google&apos;s advanced AI to analyze your
          resume against job descriptions and boost your interview chances by
          3x.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link href="/login" aria-label="Build resume for free">
            <Button
              size="lg"
              className="rounded-full bg-indigo-600 px-10 py-8 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-indigo-500/50"
            >
              Build My Resume Free
              <ArrowRight className="ml-2 h-6 w-6" aria-hidden="true" />
            </Button>
          </Link>

          <Link 
            href="https://youtu.be/6-LzPphsGh8" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Watch demo video"
          >
            <Button
              size="lg"
              className="rounded-full border-2 border-indigo-100 bg-white px-10 py-8 text-lg font-bold text-indigo-600 shadow-md transition-all hover:-translate-y-1 hover:bg-indigo-50"
            >
              <Play className="mr-2 h-6 w-6 fill-indigo-600" aria-hidden="true" />
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 border-t border-gray-100 pt-8"
        >
          <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Trusted by engineers at
          </p>
          <div className="flex flex-wrap justify-center gap-8 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
            {TRUSTED_COMPANIES.map((company) => (
              <span
                key={company}
                className="text-xl font-black text-gray-800 opacity-50"
              >
                {company}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={floatLeft}
          transition={{ delay: 0.6 }}
          className="absolute top-1/4 -left-24 z-20 hidden items-center gap-2 rounded-2xl border border-indigo-50 bg-white p-3 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] lg:flex"
        >
          <div className="rounded-lg bg-green-100 p-2">
            <Upload className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-gray-400">Status</p>
            <p className="text-sm font-bold text-gray-800">Parsing PDF...</p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={floatRight}
          transition={{ delay: 0.7 }}
          className="absolute bottom-1/4 -right-24 z-20 hidden items-center gap-2 rounded-2xl border border-indigo-50 bg-white p-3 shadow-[0_20px_50px_rgba(124,_58,_237,_0.7)] lg:flex"
        >
          <div className="rounded-lg bg-purple-100 p-2">
            <FileText className="h-5 w-5 text-purple-600" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-gray-400">ATS Score</p>
            <p className="text-sm font-bold text-gray-800">
              92/100 Excellent
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;