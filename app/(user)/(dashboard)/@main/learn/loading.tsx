// app/user/dashboard/learn/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function LearnLoading() {
  return (
    <div className="">
      {/* Header with back button */}
      <div className="sticky top-0 mb-5 flex items-center justify-between border-b-2 bg-background pb-2 sm:z-50">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-7 w-48" />
        </div>
      </div>

      {/* Multiple units skeleton */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="mb-8 rounded-xl border p-6">
          {/* Unit title and description */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-56" />
            </div>
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Progress bar skeleton */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Lessons grid skeleton */}
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}