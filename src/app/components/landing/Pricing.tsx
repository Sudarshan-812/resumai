"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
    description: "Quick resume polish.",
    popular: false,
    features: ["5 AI Resume Scans", "Basic ATS Score", "PDF Export"],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: 99,
    credits: 12,
    description: "Best for active job seekers.",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Gen", "Priority Support"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    description: "Serious career change.",
    popular: false,
    features: ["30 AI Resume Scans", "Career Assistant", "Interview Prep AI", "Lifetime Access"],
  },
] as const;

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 md:py-32"
      style={{ background: "#FFFFFF", borderTop: "1px solid #E5E3DC" }}
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#06b6d4" }}>
            Simple Pricing
          </p>
          <h2
            className="font-display font-bold tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#111111" }}
          >
            Pay once,{" "}
            <span style={{ color: "#06b6d4" }}>keep forever.</span>
          </h2>
          <p className="text-base max-w-sm mx-auto leading-relaxed" style={{ color: "#6B6860" }}>
            No recurring subscriptions. No hidden fees. Credits never expire.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col p-8 rounded-2xl"
              style={
                plan.popular
                  ? {
                      background: "#ECFEFF",
                      border: "2px solid #06b6d4",
                      boxShadow: "0 8px 32px rgba(6,182,212,0.15)",
                    }
                  : {
                      background: "#F7F6F2",
                      border: "1px solid #E5E3DC",
                    }
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
                  style={{ background: "#06b6d4" }}
                >
                  <Star size={10} className="fill-white" aria-hidden />
                  Most Popular
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "#111111" }}>{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: "#9B9890" }}>{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono tracking-tight" style={{ color: "#111111" }}>
                    ₹{plan.price}
                  </span>
                </div>
              </div>

              {/* Credits badge */}
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-6 w-fit"
                style={
                  plan.popular
                    ? { background: "rgba(6,182,212,0.15)", color: "#0891b2", border: "1px solid rgba(6,182,212,0.3)" }
                    : { background: "#EBEBEB", color: "#6B6860", border: "1px solid #E5E3DC" }
                }
              >
                {plan.credits} Credits Included
              </div>

              <div className="h-px mb-6" style={{ background: plan.popular ? "rgba(6,182,212,0.2)" : "#E5E3DC" }} />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: "#6B6860" }}>
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      style={{ color: plan.popular ? "#06b6d4" : "#C8C4BB", flexShrink: 0 }}
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/login"
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center transition-opacity hover:opacity-90 mt-auto"
                style={
                  plan.popular
                    ? { background: "#06b6d4", color: "#FFFFFF" }
                    : { background: "#FFFFFF", color: "#6B6860", border: "1px solid #E5E3DC" }
                }
              >
                Choose {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
