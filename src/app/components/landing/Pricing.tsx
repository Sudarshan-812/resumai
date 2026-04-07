"use client";

import type { FC, JSX } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Pricing Data Refactored for Semantic Styling
const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "grayscale opacity-70", 
    description: "Quick resume polish.",
    iconColor: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
    popular: false,
    features: ["5 AI Resume Scans", "Basic ATS Score", "PDF Export"],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: 99,
    credits: 12,
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "", // Original color
    description: "Best for active job seekers.",
    iconColor: "text-primary",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Gen", "Priority Support"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    lottieSrc: "https://lottie.host/655b0575-535f-47ed-91e4-8ed938e2158d/eH0Et5paMQ.lottie",
    lottieClass: "scale-110 opacity-90", 
    description: "Serious career change.",
    iconColor: "text-foreground",
    badgeClass: "bg-secondary text-secondary-foreground border-border",
    popular: false,
    features: ["30 AI Resume Scans", "Career Assistant", "Interview Prep AI", "Lifetime Access"],
  },
];

const Pricing: FC = (): JSX.Element => {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-background relative overflow-hidden border-y border-border">
      
      {/* Subtle Ambient Glows matching global theme */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* ─── HEADER (Matched to Feature Grid) ─── */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-primary mb-3.5 font-mono inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Simple Pricing
          </div>
          <h2 className="font-serif text-[clamp(32px,4vw,56px)] text-foreground tracking-[-0.02em] leading-[1.1] mb-4">
            Pay once, keep forever.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No recurring subscriptions. No hidden fees. Just pure, deterministic value for your career trajectory.
          </p>
        </div>

        {/* ─── PRICING GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-3xl transition-all duration-300 backdrop-blur-sm",
                plan.popular 
                  ? "bg-card border-2 border-primary shadow-lg shadow-primary/5 z-10" 
                  : "bg-card/50 border border-border hover:bg-card hover:border-primary/30 hover:shadow-md"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-primary-foreground" />
                  Most Popular
                </div>
              )}

              {/* Card Header */}
              <div className="mb-6 text-center">
                
                {/* Lottie Animation Container */}
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-muted/30 border border-border/50">
                   <DotLottieReact
                      src={plan.lottieSrc}
                      loop
                      autoplay
                      className={cn("w-12 h-12", plan.lottieClass)}
                   />
                </div>

                <h3 className="text-lg font-medium tracking-tight text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <span className="text-4xl font-bold tracking-tighter text-foreground font-mono">₹{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="h-px w-full bg-border mb-6" />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {/* Credit Highlight - Technical Token */}
                <li className="flex justify-center mb-6">
                  <div className={cn("px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider inline-flex items-center border", plan.badgeClass)}>
                    {plan.credits} Credits Included
                  </div>
                </li>
                
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className={cn("w-4 h-4 shrink-0 mt-0.5", plan.iconColor)} strokeWidth={2.5} />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <Link 
                href="/login"
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 mt-auto active:scale-[0.98]",
                  plan.popular 
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                    : "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
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
};

export default Pricing;