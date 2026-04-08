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

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-12 space-y-4">

        {/* Profile card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>

        {/* Info rows */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        ))}

        {/* Credits */}
        <div className="bg-card border border-border rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </div>

        {/* Sign out button */}
        <Skeleton className="h-11 w-full rounded-2xl" />

      </main>
    </div>
  );
}
