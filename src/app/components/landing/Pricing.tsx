"use client";

import Link from "next/link";
import { Check, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Pricing Data
const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "grayscale brightness-110 contrast-125", // Silver Effect
    description: "Quick resume polish.",
    color: "text-blue-500",
    badgeColor: "bg-blue-50 text-blue-700",
    popular: false,
    features: ["5 AI Resume Scans", "Basic ATS Score", "PDF Export"],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: 99,
    credits: 12,
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "", // Gold (Original)
    description: "Best for job seekers.",
    color: "text-indigo-500",
    badgeColor: "bg-indigo-50 text-indigo-700",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Gen", "Priority Support"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    lottieSrc: "https://lottie.host/655b0575-535f-47ed-91e4-8ed938e2158d/eH0Et5paMQ.lottie",
    lottieClass: "scale-110", // Diamond
    description: "Serious career change.",
    color: "text-amber-500",
    badgeColor: "bg-amber-50 text-amber-700",
    popular: false,
    features: ["30 AI Resume Scans", "Career Assistant", "Interview Prep AI", "Lifetime Access"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-[#09090b] relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide mb-4">
            <Sparkles className="w-3 h-3" />
            Simple Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Pay once, keep forever.
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            No subscriptions. No hidden fees. Just pure value for your career.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-3xl transition-all duration-300",
                "bg-white dark:bg-zinc-900/40 border backdrop-blur-sm",
                plan.popular 
                  ? "border-indigo-500 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/10 z-10 scale-100 md:scale-105" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular
                </div>
              )}

              {/* Card Header */}
              <div className="mb-6 text-center">
                {/* Animation */}
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                   <DotLottieReact
                      src={plan.lottieSrc}
                      loop
                      autoplay
                      className={cn("w-full h-full", plan.lottieClass)}
                   />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold tracking-tight">₹{plan.price}</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {/* Credit Highlight */}
                <li className="flex justify-center mb-4">
                  <div className={cn("px-3 py-1 rounded-md text-sm font-bold inline-block", plan.badgeColor)}>
                    {plan.credits} Credits Included
                  </div>
                </li>
                
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className={cn("w-5 h-5 shrink-0", plan.color)} />
                    <span className="leading-tight text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <Link 
                href="/login" // Redirects to Login/Signup to purchase
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto",
                  plan.popular 
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5" 
                    : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
                )}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}