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

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarSkeleton />

      <main className="lg:ml-60 flex-1 px-8 pt-10 pb-12">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-8 w-56 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-2.5 w-20 rounded" />
                <Skeleton className="h-6 w-14 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">

            <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-3 w-72 rounded" />
              </div>
              <Skeleton className="h-10 w-28 rounded-lg shrink-0" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <Skeleton className="h-3 w-36 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-5 border-b last:border-0 border-border">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-2.5 w-24 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-3 w-28 rounded" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
              <div className="pt-4 border-t border-border">
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
