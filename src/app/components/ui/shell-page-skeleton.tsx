import { Skeleton } from "@/app/components/ui/skeleton";

/**
 * Loading fallback for pages that render inside the dashboard shell.
 * It sits in the shell's <main> content pane — no fixed sidebar, no
 * full-viewport wrapper — so it never paints a stray box over the real UI.
 */
export default function ShellPageSkeleton() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* Header block */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 rounded-3xl border border-border bg-card px-6 py-8">
          <div className="flex items-center gap-5">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2.5">
              <Skeleton className="h-3 w-40 rounded" />
              <Skeleton className="h-7 w-64 rounded-lg" />
              <Skeleton className="h-3 w-52 rounded" />
            </div>
          </div>
          <Skeleton className="h-11 w-36 rounded-xl shrink-0" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* List */}
        <div>
          <Skeleton className="h-3 w-32 rounded mb-4" />
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 ${i < 3 ? "border-b border-border" : ""}`}
              >
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/5 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
