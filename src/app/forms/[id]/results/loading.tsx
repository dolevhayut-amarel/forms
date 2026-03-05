import { Skeleton } from "@/components/ui/skeleton"

export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8" tabIndex={-1}>
        <div className="grid grid-cols-3 gap-4">
          {(["row-1", "row-2", "row-3"] as const).map((key) => (
            <Skeleton key={key} className="h-20 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["card-1", "card-2", "card-3", "card-4"] as const).map((key) => (
            <Skeleton key={key} className="h-32 rounded-2xl" />
          ))}
        </div>

        <Skeleton className="h-64 rounded-xl" />
      </main>
    </div>
  )
}
