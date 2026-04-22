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

export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">

        <div className="mb-10 space-y-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        <Skeleton className="h-11 w-full rounded-xl mb-6" />

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 border-b last:border-0 border-border"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
