import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav skeleton */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8" tabIndex={-1}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="w-24 h-5 rounded mb-1.5" />
            <Skeleton className="w-16 h-3.5 rounded" />
          </div>
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"] as const).map((key) => (
            <div
              key={key}
              className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4"
            >
              <div className="space-y-1.5">
                <Skeleton className="w-3/4 h-4 rounded" />
                <Skeleton className="w-1/2 h-3 rounded" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-16 rounded-xl" />
                <Skeleton className="flex-1 h-16 rounded-xl" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-16 h-3 rounded" />
                <Skeleton className="w-16 h-5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
