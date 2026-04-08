"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
  lottieSrc: string;
}

const STEPS: readonly Step[] = [
  {
    title: "Upload Resume",
    description: "Drop your existing PDF. Our engine extracts the text and structure instantly.",
    lottieSrc: "https://lottie.host/5a0adcbe-b473-47e8-8343-99789e812f19/2KxJuFZpqE.lottie",
  },
  {
    title: "AI Analysis",
    description: "Gemini scores your content against the target job description to find missing keywords.",
    lottieSrc: "https://lottie.host/72fd65eb-1b1f-4609-8f50-0d3f6faa83ce/zZMf82cYVM.lottie",
  },
  {
    title: "Optimize & Export",
    description: "Apply one-click AI rewrites and download the ATS-ready version.",
    lottieSrc: "https://lottie.host/ba03714c-5ba1-4f80-9c48-00a79e0e4758/Mnxnp9QsFy.lottie",
  },
];

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const HowItWorks: FC = (): JSX.Element => {
  return (
    <section
      id="how-it-works"
      className="relative bg-background py-24 md:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-5xl px-6">

        {/* HEADER */}
        <div className="mb-20 text-center">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-primary mb-3.5 font-mono">
            How It Works
          </div>
          <h2
            id="how-it-works-heading"
            className="font-serif text-[clamp(30px,4vw,48px)] text-foreground tracking-[-0.02em] leading-[1.12] max-w-[560px] mx-auto mb-4"
          >
            From upload to optimized in under 60 seconds.
          </h2>
          <p className="text-base text-muted-foreground max-w-[480px] mx-auto leading-[1.65]">
            No complex setup. Just drop your resume, paste a job description, and let our pipeline do the heavy lifting.
          </p>
        </div>

        {/* STEPS */}
        <div className="relative mb-20">
          {/* Connector line */}
          <div
            aria-hidden="true"
            className="absolute left-[15%] right-[15%] top-16 hidden h-px bg-border md:block"
          />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative z-10">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={itemFadeUp}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/30 overflow-hidden">
                  <div className="absolute top-2.5 left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground font-mono">
                    {index + 1}
                  </div>
                  <DotLottieReact
                    src={step.lottieSrc}
                    loop
                    autoplay
                    className="h-20 w-20 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Link href="/try" aria-label="Start optimizing resume">
            <Button
              variant="ghost"
              className="group text-sm font-medium text-primary hover:bg-primary/10 hover:text-primary transition-colors h-10 px-6 rounded-full"
            >
              Start optimizing now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;
