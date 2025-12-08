"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [currentScore, setCurrentScore] = useState(0);

  // Score Color Logic
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const scoreColor = getScoreColor(score);

  // Animation Effect
  useEffect(() => {
    const duration = 1500; // Animation duration in ms
    const steps = 60; // Updates per second
    const stepTime = duration / steps;
    const increment = score / (duration / stepTime);

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setCurrentScore(score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Calculate Circle Stroke (Circumference = 2 * pi * r)
  // r=56 -> Circumference ≈ 352
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 z-10">ATS Score</p>
      
      <div className="relative w-32 h-32 z-10">
        <svg className="w-full h-full -rotate-90">
          {/* Background Ring */}
          <circle 
            cx="64" cy="64" r={radius} 
            stroke="#27272a" strokeWidth="8" fill="none" 
          />
          {/* Animated Progress Ring */}
          <motion.circle 
            cx="64" cy="64" r={radius} 
            stroke="currentColor" strokeWidth="8" fill="none"
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" 
            className={cn(scoreColor, "transition-all duration-75 ease-out")}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={cn("text-5xl font-bold tracking-tighter tabular-nums", scoreColor)}>
            {currentScore}
          </span>
        </div>
      </div>
    </div>
  );
}