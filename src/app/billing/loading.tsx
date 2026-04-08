import { Skeleton } from "@/app/components/ui/skeleton";

function NavSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
      <Skeleton className="h-5 w-28 rounded-lg" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <Skeleton className="h-12 w-72 rounded-xl mx-auto" />
          <Skeleton className="h-12 w-96 rounded-xl mx-auto" />
          <Skeleton className="h-5 w-80 rounded mx-auto" />
        </div>

        {/* 3 pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card p-8 space-y-5 flex flex-col"
              style={i === 2 ? { transform: "scaleY(1.03)" } : undefined}
            >
              {/* Icon */}
              <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
              {/* Name + price */}
              <div className="space-y-2 text-center">
                <Skeleton className="h-5 w-28 rounded mx-auto" />
                <Skeleton className="h-3.5 w-40 rounded mx-auto" />
                <Skeleton className="h-10 w-24 rounded-lg mx-auto" />
              </div>
              <Skeleton className="h-px w-full" />
              {/* Credits badge */}
              <Skeleton className="h-7 w-36 rounded-md mx-auto" />
              {/* Features */}
              <div className="space-y-3 flex-1">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 rounded" style={{ width: `${60 + j * 8}%` }} />
                  </div>
                ))}
              </div>
              {/* CTA */}
              <Skeleton className="h-12 w-full rounded-xl mt-auto" />
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="mt-20 pt-10 border-t border-border flex flex-wrap justify-center gap-8">
          {[120, 160, 140].map((w, i) => (
            <Skeleton key={i} className="h-5 rounded" style={{ width: w }} />
          ))}
        </div>

      </main>
    </div>
  );
}
