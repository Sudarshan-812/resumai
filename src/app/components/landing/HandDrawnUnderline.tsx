"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface HandDrawnUnderlineProps {
  color?: string;
  className?: string;
  delay?: number;
}

const PATH =
  "M3,13 C42,4 88,20 150,9 C185,2 230,17 260,10 C275,7 285,11 297,8";

export default function HandDrawnUnderline({
  color = "#12a594",
  className = "",
  delay = 0.9,
}: HandDrawnUnderlineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className={className}
    >
      <motion.path
        d={PATH}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.85 } : {}}
        transition={{ duration: 0.75, delay, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d={PATH}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        transform="translate(0, 2.5)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.35 } : {}}
        transition={{ duration: 0.75, delay: delay + 0.05, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
