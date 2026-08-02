"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
  borderWidth?: number;
}

/** Continuously animated gradient border ring — place as a sibling inside a `relative` parent. */
export function BorderBeam({
  className,
  colorFrom = "#12a594",
  colorTo = "#53b9ab",
  duration = 6000,
  borderWidth = 1.5,
}: BorderBeamProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--border-beam-angle", "0deg");
    const anim = animate(el, {
      "--border-beam-angle": "360deg",
      duration,
      loop: true,
      ease: "linear",
    });
    (window as any).__beamDebug = (window as any).__beamDebug || [];
    (window as any).__beamDebug.push(anim);
    console.log("[BorderBeam] created anim", anim, "paused:", anim.paused, "engine:", (globalThis as any).engine);
    return () => { anim.revert(); };
  }, [duration]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={
        {
          "--border-beam-angle": "0deg",
          padding: borderWidth,
          background: `conic-gradient(from var(--border-beam-angle), transparent 0%, ${colorFrom} 8%, ${colorTo} 14%, transparent 28%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
    />
  );
}
