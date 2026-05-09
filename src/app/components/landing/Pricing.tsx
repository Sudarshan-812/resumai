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
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: "#0A0A0A", borderTop: "1px solid #161616" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#6366f1" }}>
            Simple Pricing
          </p>
          <h2
            className="font-bold text-white tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            Pay once, keep forever.
          </h2>
          <p className="text-base max-w-sm mx-auto leading-relaxed" style={{ color: "#666666" }}>
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
                      background: "#0f0f18",
                      border: "1px solid rgba(99,102,241,0.4)",
                      boxShadow: "0 0 0 1px rgba(99,102,241,0.15), 0 20px 60px rgba(99,102,241,0.1)",
                    }
                  : {
                      background: "#111111",
                      border: "1px solid #1a1a1a",
                    }
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "#6366f1", color: "#ffffff" }}
                >
                  <Star size={10} className="fill-white" aria-hidden />
                  Most Popular
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: "#555555" }}>{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white font-mono tracking-tight">₹{plan.price}</span>
                </div>
              </div>

              {/* Credits badge */}
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-6 w-fit"
                style={
                  plan.popular
                    ? { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }
                    : { background: "#1a1a1a", color: "#555555", border: "1px solid #222222" }
                }
              >
                {plan.credits} Credits Included
              </div>

              <div className="h-px mb-6" style={{ background: "#1a1a1a" }} />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: "#777777" }}>
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      style={{ color: plan.popular ? "#6366f1" : "#444444", flexShrink: 0 }}
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
                    ? { background: "#6366f1", color: "#ffffff" }
                    : { background: "#1a1a1a", color: "#888888", border: "1px solid #222222" }
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
