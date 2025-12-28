"use client";

import type { FC, JSX } from "react";
import { motion, type Variants } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initial: string;
  gradient: string;
}

// Static testimonial data kept outside the component
// This avoids re-creation on every render and keeps JSX clean
const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "I was getting rejected instantly. After ResumAI optimized my CV, I got 3 interview calls in a week.",
    author: "Arjun K.",
    role: "Frontend Developer",
    initial: "A",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    quote:
      "The cover letter generator is magic. It actually sounds like me, but professional.",
    author: "Sarah J.",
    role: "Product Manager",
    initial: "S",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    quote:
      "Simple, fast, and effective. The ATS scoring feature is a game changer.",
    author: "David R.",
    role: "Data Scientist",
    initial: "D",
    gradient: "from-amber-500 to-orange-600",
  },
];

// Reusable fade-up animation for headings & cards
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1 },
  }),
};

const Testimonials: FC = (): JSX.Element => {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-24">
      {/* Decorative background glows (purely visual) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute right-[-5%] top-[-10%] h-[400px] w-[400px] rounded-full bg-purple-100/60 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-indigo-100/60 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl"
          >
            Trusted by{" "}
            <span className="text-indigo-600">10,000+</span> job seekers
          </motion.h2>
          <p className="text-gray-500">
            Join the community landing top-tier tech jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.article
              key={testimonial.author}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-indigo-50 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
              aria-label={`Testimonial from ${testimonial.author}`}
            >
              {/* Static 5-star rating for social proof */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <Quote
                className="mb-4 h-8 w-8 text-indigo-100"
                aria-hidden="true"
              />

              <p className="mb-6 text-lg font-medium leading-relaxed text-gray-700">
                “{testimonial.quote}”
              </p>

              <div className="flex items-center gap-3">
                {/* Avatar with gradient background */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-bold text-white shadow-md`}
                  aria-hidden="true"
                >
                  {testimonial.initial}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
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
