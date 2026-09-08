"use client";

import { motion } from "framer-motion";

/**
 * Scoped page transition for the dashboard shell. Re-mounts on every
 * navigation within the shell, so only the <main> content fades/slides —
 * the sidebar, header and their state persist.
 */
export default function ShellTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}
