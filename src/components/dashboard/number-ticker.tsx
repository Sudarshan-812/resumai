"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function NumberTicker({
  value,
  duration = 1100,
  delay = 0,
  className,
  suffix = "",
  decimals = 0,
}: NumberTickerProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setDisplay(easeOutExpo(p) * value);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [value, duration, delay]);

  return (
    <span className={cn("tabular-nums", className)}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
