"use client";

import { useRef, ElementType } from "react";
import { motion, useInView } from "framer-motion";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words";
  from?: Record<string, number | string>;
  to?: Record<string, number | string>;
  threshold?: number;
  textAlign?: React.CSSProperties["textAlign"];
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  onLetterAnimationComplete?: () => void;
  [key: string]: unknown;
}

export default function SplitText({
  text,
  className = "",
  delay = 30,
  duration = 0.6,
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  textAlign = "center",
  tag: Tag = "p",
  onLetterAnimationComplete,
  ...rest
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, amount: threshold });

  const units = splitType === "chars"
    ? text.split("")
    : text.split(" ");

  const TagEl = Tag as ElementType;

  return (
    <TagEl
      ref={ref}
      aria-label={text}
      {...rest}
      className={className}
      style={{ textAlign, ...(rest.style as React.CSSProperties) }}
    >
      {units.map((unit, i) => (
        <motion.span
          key={i}
          initial={from}
          animate={isInView ? to : from}
          transition={{
            duration,
            delay: (i * delay) / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={i === units.length - 1 ? onLetterAnimationComplete : undefined}
          style={{ display: "inline-block" }}
          aria-hidden
        >
          {unit === " " ? " " : unit}
          {splitType === "words" && i < units.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </TagEl>
  );
}
