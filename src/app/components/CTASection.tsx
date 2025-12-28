"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

// Simple scale + fade animation for the CTA container
// Using viewport.once so it animates only the first time it appears
const containerAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const CTASection: FC = (): JSX.Element => {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerAnimation}
          className="relative overflow-hidden rounded-[3rem] bg-indigo-900 px-6 py-20 text-center md:px-20"
        >
          {/* Decorative gradient blobs (purely visual, no interaction) */}
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute left-[-20%] top-[-50%] h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[100px]" />
            <div className="absolute bottom-[-50%] right-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-500/30 blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Ready to land your <br /> dream job?
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-200 md:text-xl">
              Join 10,000+ developers who are getting more interviews with
              ResumAI. It takes less than 2 minutes to get your score.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/login" aria-label="Get started with ResumAI">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-white px-8 py-6 text-lg font-bold text-indigo-900 transition-transform hover:scale-105 hover:bg-gray-100 sm:w-auto"
                >
                  Get Started for Free
                </Button>
              </Link>

              <Link href="/login" aria-label="Sign in to ResumAI">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-indigo-400/30 px-8 py-6 text-lg font-semibold text-black hover:bg-gray-200 sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm font-medium text-indigo-300">
              No credit card required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
