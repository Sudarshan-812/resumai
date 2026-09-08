import type { CSSProperties } from "react";
import Image from "next/image";

/**
 * Viva brand mark — a rounded "V" checkmark built from two capsule strokes
 * (teal + lime) with a lime tittle, reading as "vi" and as an approval check.
 *
 * - <VivaLogo />            full horizontal lockup (mark + "Viva" wordmark)
 * - <VivaLogo variant="mark" />  square glyph only
 * - <VivaMark />            raw SVG glyph (favicon / tiny / recolourable)
 *
 * The full lockup on a light background uses the designed banner asset
 * (/VivaBanner.png). On a dark background it falls back to the vector mark
 * plus a white wordmark so it stays legible.
 */

const TEAL = "#12A594";
const LIME = "#8FD91F";
const SHADOW = "#0B6E63";

const BANNER_W = 2146;
const BANNER_H = 733;
const BANNER_RATIO = BANNER_W / BANNER_H;

type Variant = "full" | "mark";

interface VivaLogoProps {
  /** Rendered height in px. Width follows the lockup's aspect ratio. */
  height?: number;
  /** "full" = mark + wordmark, "mark" = glyph only. */
  variant?: Variant;
  /** true => render for a dark background (vector mark + white wordmark). */
  onDark?: boolean;
  /** Pass through to next/image for above-the-fold logos. */
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
  /** Provide an accessible name when the mark stands alone. */
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
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M11 21 L29 53" stroke={TEAL} strokeWidth="15" strokeLinecap="round" />
      <path d="M22.5 41 L29 53" stroke={SHADOW} strokeWidth="15" strokeLinecap="round" />
      <path d="M29 53 L51 21" stroke={LIME} strokeWidth="15" strokeLinecap="round" />
      <circle cx="52" cy="7" r="6" fill={LIME} />
    </svg>
  );
}

export default function VivaLogo({
  height = 30,
  variant = "full",
  onDark = false,
  priority = false,
  className = "",
  style,
}: VivaLogoProps) {
  if (variant === "mark") {
    return <VivaMark size={height} className={className} title="Viva" />;
  }

  if (onDark) {
    return (
      <span
        className={className}
        role="img"
        aria-label="Viva"
        style={{ display: "inline-flex", alignItems: "center", gap: height * 0.28, ...style }}
      >
        <VivaMark size={height} />
        <span
          style={{
            fontFamily: "var(--font-sans), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: height * 0.72,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#FFFFFF",
          }}
        >
          Viva
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/VivaBanner.png"
      alt="Viva"
      width={Math.round(height * BANNER_RATIO)}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto", ...style }}
    />
  );
}
