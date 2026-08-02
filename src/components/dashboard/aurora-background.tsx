"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = containerRef.current?.querySelectorAll<HTMLDivElement>("[data-blob]");
    if (!blobs?.length) return;
    const anims = Array.from(blobs).map((blob, i) =>
      animate(blob, {
        translateX: [-20 - i * 10, 20 + i * 10],
        translateY: [-15 - i * 8, 15 + i * 8],
        duration: 8000 + i * 2000,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      })
    );
    return () => anims.forEach((a) => a.revert());
  }, []);

  return (
    <div ref={containerRef} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div data-blob className="absolute -top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[80px]" />
      <div data-blob className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-teal-300/20 blur-[80px]" />
      <div data-blob className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-[70px]" />
    </div>
  );
}
