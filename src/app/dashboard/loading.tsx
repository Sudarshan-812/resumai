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

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-9 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-2.5 w-24 rounded" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">

            <div className="rounded-2xl border border-border bg-card p-8 flex items-center gap-6">
              <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3.5 w-80 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
              <Skeleton className="h-10 w-28 rounded-lg shrink-0" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-5 border-b last:border-0 border-border">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-2.5 w-28 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-3 w-32 rounded" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
              <div className="pt-4 border-t border-border">
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
