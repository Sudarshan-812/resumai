"use client";

import { MotionConfig } from "framer-motion";

/**
 * App-wide Framer Motion config. `reducedMotion="user"` makes every
 * `motion` component honour the OS "reduce motion" setting (transforms and
 * layout animations are skipped; opacity fades stay). CSS animations are
 * handled by the prefers-reduced-motion block in globals.css.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
