"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, Microphone as Mic } from "@phosphor-icons/react";
import { CREDIT_PACKS } from "@/app/lib/plans";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 md:py-32"
      style={{ background: "#FFFFFF", borderTop: "1px solid #d9d9e0" }}
    >
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-5 font-mono" style={{ color: "#12a594" }}>
            Simple Pricing
          </p>
          <h2
            className="font-display font-bold tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#1c2024" }}
          >
            Pay once.{" "}
            <span style={{ color: "#12a594" }}>Keep forever.</span>
          </h2>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: "#60646c" }}>
            No subscriptions, no monthly fees. Credits are for resume analyses and never expire. One credit is one full report.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {CREDIT_PACKS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={plan.popular
                ? { y: -8, boxShadow: "0 24px 60px rgba(18,165,148,0.22)" }
                : { y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.99 }}
              className="relative flex flex-col p-8 rounded-2xl"
              style={
                plan.popular
                  ? {
                      background: "#e0f8f3",
                      border: "1px solid #12a594",
                      boxShadow: "0 0 0 1px #12a594 inset, 0 8px 32px rgba(18,165,148,0.14)",
                    }
                  : {
                      background: "#f9f9fb",
                      border: "1px solid #d9d9e0",
                    }
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap"
                  style={{ background: "#12a594" }}
                >
                  <Star size={10} className="fill-white" aria-hidden />
                  Most Popular
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "#1c2024" }}>{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: "#80838d" }}>{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono tracking-tight" style={{ color: "#1c2024" }}>
                    ${plan.priceUsd}
                  </span>
                  <span className="text-xs font-medium" style={{ color: "#80838d" }}>one-time</span>
                </div>
              </div>

              {/* Credits badge */}
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-6 w-fit"
                style={
                  plan.popular
                    ? { background: "rgba(18,165,148,0.15)", color: "#008573", border: "1px solid rgba(18,165,148,0.3)" }
                    : { background: "#EBEBEB", color: "#60646c", border: "1px solid #d9d9e0" }
                }
              >
                {plan.credits} analyses included
              </div>

              <div className="h-px mb-6" style={{ background: plan.popular ? "rgba(18,165,148,0.25)" : "#d9d9e0" }} />

              {/* Features */}
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "#b9bbc6" }}
              >
                What&apos;s included
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: "#60646c" }}>
                    <Check
                      size={14}
                      weight="bold"
                      style={{ color: plan.popular ? "#12a594" : "#b9bbc6", flexShrink: 0 }}
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/login?next=/billing&plan=${plan.id}`}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center transition-opacity hover:opacity-90 mt-auto"
                style={
                  plan.popular
                    ? { background: "#12a594", color: "#FFFFFF" }
                    : { background: "#FFFFFF", color: "#60646c", border: "1px solid #d9d9e0" }
                }
              >
                Get {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Free-forever line */}
        <div className="mt-10 flex items-center justify-center gap-2.5 text-sm" style={{ color: "#60646c" }}>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0"
            style={{ background: "rgba(18,165,148,0.1)" }}
          >
            <Mic size={14} style={{ color: "#12a594" }} aria-hidden />
          </span>
          Every plan — and the free trial — includes <strong className="font-semibold" style={{ color: "#1c2024" }}>&nbsp;unlimited AI mock interviews</strong>, voice and text. No credits, ever.
        </div>

      </div>
    </section>
  );
}
