import type { CSSProperties } from "react";

/**
 * Viva brand mark — a "V" checkmark built from two rounded capsule strokes
 * (cyan-teal + lime) with a lime tittle floating above the taller right arm,
 * reading as "vi" and as an approval check. Redrawn as vector so the dot
 * never clips and the mark stays crisp at every size.
 */

const TEAL = "#1AA79E";
const LIME = "#95DB1F";
const SHADOW = "#0C6E66";
const INK = "#15192A";

// The dot needs headroom above the right arm, so the viewBox extends upward.
const VB_MIN_Y = -16;
const VB_W = 64;
const VB_H = 82;

type Variant = "full" | "mark";

interface VivaLogoProps {
  /** Rendered height in px of the mark; the wordmark scales with it. */
  height?: number;
  /** "full" = mark + "Viva" wordmark, "mark" = glyph only. */
  variant?: Variant;
  /** true => white wordmark for dark backgrounds. */
  onDark?: boolean;
  /** Kept for call-site compatibility; the SVG needs no preloading. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function VivaMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Accessible name when the mark stands alone. */
  title?: string;
}) {
  return (
    <svg
      width={Math.round((size * VB_W) / VB_H)}
      height={size}
      viewBox={`0 ${VB_MIN_Y} ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* left arm */}
      <path d="M11 20 L27 52" stroke={TEAL} strokeWidth="14" strokeLinecap="round" />
      {/* overlap shadow where the arms cross */}
      <path d="M20 38 L27 52" stroke={SHADOW} strokeWidth="14" strokeLinecap="round" />
      {/* right arm (taller) */}
      <path d="M27 52 L50 18" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
      {/* tittle — clear gap above the right arm */}
      <circle cx="52" cy="-1" r="7.5" fill={LIME} />
    </svg>
  );
}

export default function VivaLogo({
  height = 28,
  variant = "full",
  onDark = false,
  className = "",
  style,
}: VivaLogoProps) {
  if (variant === "mark") {
    return <VivaMark size={height} className={className} title="Viva" />;
  }

  return (
    <span
      className={className}
      role="img"
      aria-label="Viva"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.max(6, Math.round(height * 0.42)),
        ...style,
      }}
    >
      <VivaMark size={height} />
      <span
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: Math.round(height * 0.72),
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: onDark ? "#FFFFFF" : INK,
        }}
      >
        Viva
      </span>
    </span>
  );
}
