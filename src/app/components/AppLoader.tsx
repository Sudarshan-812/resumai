"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Column8Logo from "@/components/branding/Column8Logo";

export default function AppLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0A0A0A]"
        >
          <Column8Logo width={400} height={155} />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-8 text-xs font-light text-[#0D9488] tracking-[0.3em]"
          >
            INITIALIZING CORTEX ENGINE...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
