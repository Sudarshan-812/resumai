"use client";

import { useEffect, useState } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
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
    const state = { val: 0 };
    const anim = animate(state, {
      val: value,
      duration,
      delay,
      ease: "outExpo",
      onUpdate: () => setDisplay(state.val),
    });
    return () => anim.revert();
  }, [value, duration, delay]);

  return (
    <span className={cn("tabular-nums", className)}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
