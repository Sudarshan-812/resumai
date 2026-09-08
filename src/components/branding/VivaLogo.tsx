import type { CSSProperties } from "react";

/**
 * Viva brand mark — a "V" checkmark built from two rounded capsule strokes
 * (cyan-teal + lime) with a lime tittle just above the taller right arm,
 * reading as "vi" and as an approval check.
 */

const TEAL = "#1AA79E";
const LIME = "#95DB1F";
const SHADOW = "#0C6E66";
const INK = "#15192A";

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
  style,
  title,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible name when the mark stands alone. */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* left arm */}
      <path d="M13 19 L29 49" stroke={TEAL} strokeWidth="14" strokeLinecap="round" />
      {/* overlap shadow where the arms cross */}
      <path d="M22 35 L29 49" stroke={SHADOW} strokeWidth="14" strokeLinecap="round" />
      {/* right arm (taller) */}
      <path d="M29 49 L50 21" stroke={LIME} strokeWidth="14" strokeLinecap="round" />
      {/* tittle — small gap above the right arm */}
      <circle cx="51" cy="8" r="5.5" fill={LIME} />
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
        gap: Math.max(5, Math.round(height * 0.2)),
        ...style,
      }}
    >
      {/* optical nudge: the V reads a touch low next to the wordmark */}
      <VivaMark size={height} style={{ transform: `translateY(${-Math.round(height * 0.07)}px)` }} />
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
