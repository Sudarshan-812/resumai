import { Skeleton } from "@/app/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <div className="hidden lg:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-screen border-r border-border bg-secondary">
      <div className="flex items-center gap-3 h-14 px-5 border-b border-border">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="flex-1 p-3 space-y-5 overflow-hidden">
        {([3, 3, 2] as const).map((count, gi) => (
          <div key={gi}>
            <Skeleton className="h-2.5 w-12 mb-2.5 ml-1" />
            <div className="space-y-1">
              {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border space-y-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <div className="flex items-center gap-3 px-1">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function BillingLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarSkeleton />

      <main className="lg:ml-60 flex-1 px-8 pt-10 pb-20">

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Skeleton className="h-10 w-64 rounded-xl mx-auto" />
          <Skeleton className="h-10 w-80 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-72 rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-8 space-y-5 flex flex-col"
            >
              <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-5 w-24 rounded mx-auto" />
                <Skeleton className="h-3.5 w-36 rounded mx-auto" />
                <Skeleton className="h-9 w-20 rounded-lg mx-auto" />
              </div>
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-7 w-32 rounded-md mx-auto" />
              <div className="space-y-3 flex-1">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 rounded" style={{ width: `${60 + j * 8}%` }} />
                  </div>
                ))}
              </div>
              <Skeleton className="h-11 w-full rounded-xl mt-auto" />
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-wrap justify-center gap-8">
          {[120, 160, 140].map((w, i) => (
            <Skeleton key={i} className="h-5 rounded" style={{ width: w }} />
          ))}
        </div>

      </main>
    </div>
  );
}
