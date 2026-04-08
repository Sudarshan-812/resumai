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

export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 space-y-8">

        {/* Back + title */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        </div>

        {/* Score ring + actions bar */}
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center gap-8">
          {/* Ring */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <Skeleton className="h-36 w-36 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          {/* Stats beside ring */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-background/60 p-4 space-y-2">
                <Skeleton className="h-2.5 w-20 rounded" />
                <Skeleton className="h-6 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {[140, 120, 100].map((w, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" style={{ width: w }} />
          ))}
        </div>

        {/* Two-column sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keywords section */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex flex-wrap gap-2">
              {[80, 64, 96, 72, 56, 88, 60, 76].map((w, i) => (
                <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* Missing keywords */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-40 rounded" />
            <div className="flex flex-wrap gap-2">
              {[72, 88, 60, 96, 68, 80].map((w, i) => (
                <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions list */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-32 rounded mb-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
              <Skeleton className="h-5 w-5 rounded-md shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32 rounded" />
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
