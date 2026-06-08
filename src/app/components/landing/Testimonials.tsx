"use client";

import type { FC, JSX } from "react";
import { motion, type Variants } from "framer-motion";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initial: string;
  accentColor: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: "I was getting rejected instantly. After Column8 optimized my CV, I got 3 interview calls in a week.",
    author: "Arjun K.",
    role: "Frontend Developer",
    initial: "A",
    accentColor: "#06b6d4",
  },
  {
    quote: "The cover letter generator is magic. It actually sounds like me, but professional.",
    author: "Sarah J.",
    role: "Product Manager",
    initial: "S",
    accentColor: "#0891b2",
  },
  {
    quote: "Simple, fast, and effective. The ATS scoring feature is a game changer.",
    author: "David R.",
    role: "Data Scientist",
    initial: "D",
    accentColor: "#22d3ee",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: EASE },
  }),
};

const starVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.07, type: "spring", stiffness: 500, damping: 20 },
  }),
};

const Testimonials: FC = (): JSX.Element => {
  return (
    <section
      className="py-24 md:py-32"
      style={{ background: "#FFFFFF", borderTop: "1px solid #E5E3DC" }}
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono"
            style={{ color: "#06b6d4" }}
          >
            What People Say
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#111111" }}
          >
            Trusted by{" "}
            <span style={{ color: "#06b6d4" }}>10,000+</span> job seekers
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.author}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 20px 44px rgba(0,0,0,0.07)" }}
              transition={SPRING}
              className="flex flex-col p-7 rounded-2xl"
              style={{ background: "#F7F6F2", border: "1px solid #E5E3DC" }}
              aria-label={`Testimonial from ${t.author}`}
            >
              {/* Stars — staggered spring entrance */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <motion.svg
                    key={si}
                    custom={si}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={starVariants}
                    width="13" height="13" viewBox="0 0 14 14" fill="#F59E0B"
                    aria-hidden="true"
                  >
                    <path d="M7 1l1.545 3.13 3.455.502-2.5 2.438.59 3.44L7 8.885 3.91 10.51l.59-3.44L2 4.632l3.455-.502z" />
                  </motion.svg>
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed mb-6" style={{ color: "#6B6860" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: t.accentColor }}
                  aria-hidden="true"
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none" style={{ color: "#111111" }}>
                    {t.author}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#9B9890" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
