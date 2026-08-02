import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
  borderWidth?: number;
}

/** Continuously animated gradient border ring — place as a sibling inside a `relative` parent. */
export function BorderBeam({
  className,
  colorFrom = "#12a594",
  colorTo = "#53b9ab",
  duration = 6000,
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden", className)}
      style={{
        padding: borderWidth,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      <div
        className="absolute -inset-[75%]"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent 70%)`,
          animation: `border-beam-spin ${duration}ms linear infinite`,
        }}
      />
    </div>
  );
}
