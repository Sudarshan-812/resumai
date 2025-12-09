"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { 
  ArrowRight, Zap, Shield, BarChart3, 
  Play, Sparkles, Menu, X, Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

// 👇 YOUR CUSTOM COMPONENTS
import Footer from "@/app/components/landing/Footer";
import Testimonials from "@/app/components/Testimonials"; // Make sure Testimonials.tsx is in src/components/

// --- COMPONENT: SPOTLIGHT HERO BACKGROUND ---
function Spotlight({ className, fill = "white" }: { className?: string; fill?: string }) {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}

// --- COMPONENT: GLOWING CARD ---
function GlowingCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn("group relative border border-white/10 bg-zinc-900/50 overflow-hidden rounded-xl", className)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(120, 119, 198, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// --- COMPONENT: NAVBAR ---
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      scrolled || mobileMenuOpen ? "bg-black/90 backdrop-blur-md border-white/10 py-4" : "bg-transparent border-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black fill-black" />
          </div>
          ResumAI
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/login">
            <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
          <Link href="/login" className="text-lg font-medium text-zinc-400 hover:text-white">Sign In</Link>
          <Link href="/login" className="w-full">
            <button className="w-full bg-white text-black px-5 py-3 rounded-xl text-lg font-bold hover:bg-zinc-200">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-12 md:pt-48 md:pb-32 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] md:text-xs font-medium text-zinc-300 mb-6 md:mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            v2.0 live with Gemini 1.5
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 pb-6"
          >
            Craft the Perfect <br />
            Resume with AI.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-xl text-zinc-400 max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4"
          >
            Stop guessing what recruiters want. Our AI analyzes your resume against job descriptions to give you a 
            <span className="text-white font-semibold"> top 1% ATS score</span>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <Link href="/login" className="w-full sm:w-auto">
              {/* 👇 UPDATED BUTTON: Added 'h-14' and 'md:text-lg' for better mobile touch area */}
              <button className="w-full sm:w-auto group relative px-8 h-14 bg-white text-black rounded-full font-bold text-base md:text-lg hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                Analyze My Resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-ping opacity-20" />
              </button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 h-14 bg-zinc-900 text-white border border-zinc-800 rounded-full font-bold text-base md:text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </button>
            </Link>
          </motion.div>
          
          {/* Dashboard Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="mt-16 md:mt-20 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-sm shadow-2xl lg:rounded-3xl"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent z-20" />
            
            <img 
              src="/dashboard-preview.png" 
              alt="Dashboard Preview" 
              className="rounded-lg lg:rounded-2xl w-full h-auto object-cover opacity-90"
            />
          </motion.div>
        </div>
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <Testimonials />

      {/* --- FEATURES (BENTO GRID) --- */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-12 md:mb-20">
             <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br /><span className="text-zinc-500">get hired faster.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Large */}
            <GlowingCard className="md:col-span-2 p-6 md:p-12 flex flex-col justify-between min-h-[300px] md:min-h-[400px]">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Instant ATS Scoring</h3>
                <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                  Upload your PDF and get a score from 0-100 in seconds. We check for keywords, formatting, and readability issues.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                 <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-emerald-400">Score: 92/100</div>
                 <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-400">Readability: High</div>
              </div>
            </GlowingCard>

            {/* Feature 2: Tall */}
            <GlowingCard className="md:col-span-1 p-6 md:p-12 min-h-[300px] md:min-h-[400px]">
              <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Fixes</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Don't just see the errors. Let our AI rewrite your bullet points to be more impactful.
              </p>
              <div className="space-y-3">
                 {[1,2,3].map((i) => (
                   <div key={i} className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-500/50 w-2/3" />
                   </div>
                 ))}
              </div>
            </GlowingCard>

            {/* Feature 3: Wide */}
            <GlowingCard className="md:col-span-3 p-6 md:p-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
               <div>
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Interview Prep</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    Paste the job description and generate tailored applications and interview questions instantly.
                  </p>
                  <Link href="/login" className="text-amber-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    Try Copilot <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-zinc-500">
                  <p className="text-purple-400 mb-2">{">"} Generating Cover Letter...</p>
                  <p className="mb-2">Dear Hiring Manager,</p>
                  <p className="mb-2">I am writing to express my strong interest...</p>
                  <span className="inline-block w-2 h-4 bg-zinc-500 animate-pulse" />
               </div>
            </GlowingCard>

          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 border-t border-zinc-800 bg-black/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Simple Pricing</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Pay once, use forever. No monthly subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-white">Starter</h3>
              <div className="text-4xl font-bold mb-6 text-white">₹49</div>
              <ul className="space-y-4 mb-8 text-zinc-400">
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> 5 AI Resume Scans</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Basic ATS Score</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Email Support</li>
              </ul>
              <Link href="/login" className="block w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-center font-bold transition-all">
                Get Started
              </Link>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="relative p-8 rounded-3xl border-2 border-indigo-600 bg-zinc-900/50 transform md:-translate-y-4 shadow-2xl shadow-indigo-900/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2 text-indigo-400">Pro Bundle</h3>
              <div className="text-4xl font-bold mb-6 text-white">₹99</div>
              <ul className="space-y-4 mb-8 text-zinc-300">
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> 12 AI Resume Scans</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Detailed Feedback</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Cover Letter Generator</li>
              </ul>
              <Link href="/login" className="block w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-center font-bold shadow-lg shadow-indigo-500/25 transition-all">
                Get Started
              </Link>
            </div>

            {/* Power Plan */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-white">Power User</h3>
              <div className="text-4xl font-bold mb-6 text-white">₹199</div>
              <ul className="space-y-4 mb-8 text-zinc-400">
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> 30 AI Resume Scans</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Interview Prep AI</li>
                <li className="flex gap-3"><Check className="text-indigo-500 w-5 h-5 shrink-0" /> Priority Support</li>
              </ul>
              <Link href="/login" className="block w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-center font-bold transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}