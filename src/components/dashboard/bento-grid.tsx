import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      {children}
    </div>
  );
}

interface BentoCardProps extends React.ComponentProps<"div"> {
  span?: 1 | 2 | 3;
}

export function BentoCard({ className, children, span = 1, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card p-5",
        span === 2 && "md:col-span-2",
        span === 3 && "md:col-span-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
