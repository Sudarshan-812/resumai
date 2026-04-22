"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitTextRevealProps {
  children: string;
  className?: string;
}

export function SplitTextReveal({ children, className }: SplitTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const chars = children.split("");
  const center = Math.floor(chars.length / 2);

  return (
    <span
      ref={ref}
      className={cn("inline", className)}
      style={{ perspective: "600px" }}
    >
      {chars.map((char, i) => {
        const dist = i - center;
        const isSpace = char === " ";
        return (
          <motion.span
            key={i}
            className={cn("inline-block", isSpace && "w-[0.28em]")}
            initial={{ x: dist * 40, rotateX: dist * 40, opacity: 0 }}
            animate={isInView ? { x: 0, rotateX: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.7,
              delay: Math.abs(dist) * 0.015,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
