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

export default function ResumesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <NavSkeleton />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-12">
        <div className="flex flex-col items-center py-20 gap-4">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
      </main>
    </div>
  );
}
