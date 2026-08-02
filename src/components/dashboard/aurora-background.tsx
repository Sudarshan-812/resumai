import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[80px]"
        style={{
          animation: "aurora-drift 9s ease-in-out infinite",
          "--drift-x-from": "-30px", "--drift-y-from": "-23px",
          "--drift-x-to": "30px", "--drift-y-to": "23px",
        } as React.CSSProperties}
      />
      <div
        className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-teal-300/20 blur-[80px]"
        style={{
          animation: "aurora-drift 11s ease-in-out infinite",
          "--drift-x-from": "-40px", "--drift-y-from": "-31px",
          "--drift-x-to": "40px", "--drift-y-to": "31px",
        } as React.CSSProperties}
      />
      <div
        className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-[70px]"
        style={{
          animation: "aurora-drift 13s ease-in-out infinite",
          "--drift-x-from": "-50px", "--drift-y-from": "-39px",
          "--drift-x-to": "50px", "--drift-y-to": "39px",
        } as React.CSSProperties}
      />
    </div>
  );
}
