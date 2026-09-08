"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const SHELL_PREFIXES = ["/dashboard", "/history", "/billing", "/settings"];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Shell routes animate their own content in (shell)/template.tsx so the
  // sidebar and header stay put — don't also fade the whole app frame here.
  const inShell = SHELL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (inShell) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
    >
      {children}
    </motion.div>
  );
}
