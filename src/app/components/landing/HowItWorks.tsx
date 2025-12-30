"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
  lottieSrc: string;
}

const STEPS: readonly Step[] = [
  {
    title: "Upload Resume",
    description: "Drop your existing PDF. We parse it instantly.",
    // Upload Animation
    lottieSrc: "https://lottie.host/5a0adcbe-b473-47e8-8343-99789e812f19/2KxJuFZpqE.lottie",
  },
  {
    title: "AI Analysis",
    description: "Our engine scores it against your target job.",
    // AI Loading Animation
    lottieSrc: "https://lottie.host/72fd65eb-1b1f-4609-8f50-0d3f6faa83ce/zZMf82cYVM.lottie",
  },
  {
    title: "Optimize & Export",
    description: "Apply fixes and download the ATS-ready version.",
    // Download Animation
    lottieSrc: "https://lottie.host/ba03714c-5ba1-4f80-9c48-00a79e0e4758/Mnxnp9QsFy.lottie",
  },
];

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.2 },
  }),
};

const HowItWorks: FC = (): JSX.Element => {
  return (
    <section
      id="how-it-works"
      className="relative bg-white py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <h2
            id="how-it-works-heading"
            className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl"
          >
            How it works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Three simple steps to your dream job.
          </p>
        </div>

        <div className="relative mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Connector Line (visible on desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-[15%] right-[15%] top-20 hidden h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent md:block"
          />

          {STEPS.map((step, index) => {
            return (
              <motion.div
                key={step.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemFadeUp}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Animation Container */}
                {/* Added 'overflow-hidden' here to force the circle shape */}
                <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full border-4 border-indigo-50 bg-white shadow-xl shadow-indigo-100 transition-transform duration-300 hover:scale-105 overflow-hidden">
                  <DotLottieReact
                    src={step.lottieSrc}
                    loop
                    autoplay
                    className="h-full w-full"
                  />
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="max-w-xs leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Link href="/signup" aria-label="Start optimizing resume">
            <Button
              variant="ghost"
              className="text-lg font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Start optimizing now
              <ChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;