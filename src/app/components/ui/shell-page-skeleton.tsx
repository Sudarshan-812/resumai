import { Skeleton } from "@/app/components/ui/skeleton";

/**
 * Loading fallback for pages that render inside the dashboard shell.
 * Sits in the shell's <main> content pane — no fixed sidebar, no
 * full-viewport wrapper — so it never paints a stray box over the real UI.
 */
export default function ShellPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8 py-8">
      <div className="mb-7 space-y-2">
        <Skeleton className="h-6 w-52 rounded" />
        <Skeleton className="h-3.5 w-72 rounded" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="h-12 border-b border-border flex items-center px-4">
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex items-center gap-3 px-4 h-[52px] ${i < 4 ? "border-b border-border" : ""}`}>
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/5 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
              <Skeleton className="h-3.5 w-8 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex items-center gap-3 px-3.5 py-3 ${i < 2 ? "border-b border-border" : ""}`}>
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-2.5 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
