"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [currentScore, setCurrentScore] = useState(0);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500 text-emerald-500";
    if (s >= 60) return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };

  const colors = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setCurrentScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (240 / 360) * circumference;
  const dashOffset = arcLength - (currentScore / 100) * arcLength;

  return (
    <div className="group relative flex flex-col items-center justify-center p-8 border border-border bg-card rounded-3xl shadow-sm overflow-hidden">

      <div className="absolute top-0 inset-x-0 h-8 border-b border-border bg-muted/30 flex items-center justify-between px-4">
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          Telemetry_04
        </span>
        <Activity size={10} className="text-muted-foreground/30" />
      </div>

      <div className="mt-4 relative w-48 h-48">
        <svg className="w-full h-full rotate-[150deg]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="text-muted/30"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray="1 7.35"
            strokeDashoffset="0.5"
            className="text-background"
          />

          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(colors, "drop-shadow-[0_0_8px_rgba(var(--color-primary),0.3)]")}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-6xl font-bold font-mono tracking-tighter tabular-nums leading-none", colors.split(' ')[1])}
          >
            {currentScore}
          </motion.span>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Index_Match
            </span>
            <div className="mt-1 h-1 w-8 rounded-full bg-border overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${currentScore}%` }}
                 className={cn("h-full", colors.split(' ')[1].replace('text', 'bg'))}
               />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", colors.split(' ')[1].replace('text', 'bg'))} />
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
          {score >= 80 ? "Optimized_High" : score >= 60 ? "Action_Required" : "Critical_Fail"}
        </span>
      </div>

    </div>
  );
}
