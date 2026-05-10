"use client";

import React from "react";
import { motion } from "framer-motion";

interface Column8LogoProps {
  width?: number;
  height?: number;
  showTagline?: boolean;
  animate?: boolean;
  onDark?: boolean;   // true = white palette (for dark bg); false = black palette (for light bg)
  className?: string;
}

const Column8Logo: React.FC<Column8LogoProps> = ({
  width = 310,
  height = 120,
  showTagline = true,
  animate = true,
  onDark = false,
  className = "",
}) => {
  const skip = !animate;
  const ink  = onDark ? "#FAFAFA" : "#111111";   // right col, bottom bar, wordmark

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 620 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Column8 — From Apply to Offer"
      role="img"
    >
      <defs>
        <linearGradient id="c8-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* ── Left column — cyan/teal gradient, grows from bottom ── */}
      <motion.rect
        id="col-left"
        x={40} y={45} width={15} height={150} rx={7}
        fill="url(#c8-grad)"
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        initial={skip ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={skip ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 24, delay: 0 }}
      />

      {/* ── Right column — ink colour, slight stagger ── */}
      <motion.rect
        id="col-right"
        x={105} y={45} width={15} height={150} rx={7}
        fill={ink}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        initial={skip ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={skip ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 24, delay: 0.13 }}
      />

      {/* ── Top bar — cyan/teal gradient, draws left to right ── */}
      <motion.path
        id="bar-top"
        d="M 30,93 L 130,80"
        stroke="url(#c8-grad)" strokeWidth={13} strokeLinecap="round" fill="none"
        initial={skip ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={skip ? { duration: 0 } : {
          pathLength: { duration: 0.38, delay: 0.48, ease: "easeOut" },
          opacity:    { duration: 0.05, delay: 0.48 },
        }}
      />

      {/* ── Bottom bar — ink colour, slight delay ── */}
      <motion.path
        id="bar-bottom"
        d="M 30,157 L 130,170"
        stroke={ink} strokeWidth={13} strokeLinecap="round" fill="none"
        initial={skip ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={skip ? { duration: 0 } : {
          pathLength: { duration: 0.38, delay: 0.63, ease: "easeOut" },
          opacity:    { duration: 0.05, delay: 0.63 },
        }}
      />

      {/* ── Wordmark — slides up + fades in ── */}
      <motion.g
        id="wordmark"
        initial={skip ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={skip ? { duration: 0 } : { duration: 0.55, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
      >
        <text
          x="158" y="143"
          fontFamily="Outfit, system-ui, sans-serif"
          fontSize="56" fontWeight="600"
          fill={ink} letterSpacing="-2"
        >
          Column<tspan fill="#22D3EE">8</tspan>
        </text>
      </motion.g>

      {/* ── Tagline — last to appear ── */}
      {showTagline && (
        <motion.g
          id="tagline"
          initial={skip ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={skip ? { duration: 0 } : { duration: 0.7, delay: 1.32 }}
        >
          <text
            x="295" y="177"
            fontFamily="Outfit, system-ui, sans-serif"
            fontSize="11" fontWeight="300"
            fill="#0D9488" letterSpacing="5" textAnchor="middle"
          >
            FROM APPLY TO OFFER
          </text>
        </motion.g>
      )}
    </motion.svg>
  );
};

export default Column8Logo;
