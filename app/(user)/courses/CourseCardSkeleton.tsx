import { Skeleton } from '@/components/ui/skeleton'

export function CourseCardSkeleton() {
  return (
    <div className="group cursor-pointer space-y-3 rounded-xl border-2 border-transparent p-4 transition hover:border-black hover:bg-black/5">
      {/* Image/Icon skeleton */}
      <Skeleton className="h-12 w-12 rounded-lg" />
      
      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4" />
      
      {/* Description skeleton */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}