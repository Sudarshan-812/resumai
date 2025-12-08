"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (!isAnimating) {
      setTimeout(() => {
        const nextWord =
          words[(words.indexOf(currentWord) + 1) % words.length];
        setCurrentWord(nextWord);
        setIsAnimating(true);
      }, duration);
    }
  }, [currentWord, isAnimating, duration, words]);

  return (
    <div className={cn("overflow-hidden flex flex-col", className)}>
      <AnimatePresence
        mode="popLayout"
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.div
          initial={{
            y: 100,
          }}
          animate={{
            y: 0,
          }}
          exit={{
            y: -100,
          }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30,
          }}
          key={currentWord}
        >
          {currentWord}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};