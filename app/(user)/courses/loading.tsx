import { CourseCardSkeleton } from '@/app/(user)/courses/CourseCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesLoading() {
  return (
    <div className="mx-auto w-full max-w-[912px] space-y-6">
      {/* Page header skeleton */}
      <Skeleton className="h-8 w-64" />

      {/* Course grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}