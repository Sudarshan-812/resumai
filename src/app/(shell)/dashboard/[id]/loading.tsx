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

export default function ReportLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarSkeleton />

      <main className="lg:ml-60 flex-1 px-8 pt-10 pb-16 space-y-8 max-w-5xl">

        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-background/60 p-4 space-y-2">
                <Skeleton className="h-2.5 w-20 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[140, 120, 100].map((w, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" style={{ width: w }} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex flex-wrap gap-2">
              {[80, 64, 96, 72, 56, 88, 60, 76].map((w, i) => (
                <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex flex-wrap gap-2">
              {[72, 88, 60, 96, 68, 80].map((w, i) => (
                <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-28 rounded mb-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
              <Skeleton className="h-5 w-5 rounded-md shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
