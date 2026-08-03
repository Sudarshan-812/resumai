"use client";

import { Coin } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CoinLoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

export function CoinLoader({ size = 20, className, label = "Loading" }: CoinLoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className="relative inline-flex shrink-0 flex-col items-center justify-center align-middle"
      style={{ width: size, height: size, perspective: size * 6 }}
    >
      <Coin
        size={size}
        weight="fill"
        className={cn("text-primary [animation:coin-toss_1.1s_cubic-bezier(0.45,0,0.55,1)_infinite]", className)}
        style={{ transformStyle: "preserve-3d" }}
      />
      <span
        aria-hidden
        className="absolute rounded-full bg-foreground/40 blur-[1px] [animation:coin-toss-shadow_1.1s_cubic-bezier(0.45,0,0.55,1)_infinite]"
        style={{ width: size * 0.7, height: size * 0.14, bottom: -size * 0.16 }}
      />
    </span>
  );
}

export function CoinLoaderOverlay({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4">
      <CoinLoader size={48} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
