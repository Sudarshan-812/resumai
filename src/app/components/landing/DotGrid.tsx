interface DotGridProps {
  color?: string;
  size?: number;
  opacity?: number;
  className?: string;
}

export default function DotGrid({
  color = "#1c2024",
  size = 28,
  opacity = 0.055,
  className = "",
}: DotGridProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
      }}
    />
  );
}
