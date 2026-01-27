import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesLoading() {
  return (
    <div className="mx-auto w-full max-w-[912px] space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative">
            <div className="flex min-h-[217px] flex-col items-center justify-center gap-y-6 rounded-xl border-2 border-b-4 bg-card px-[30%] pb-6 pt-14">
              <Skeleton className="h-20 w-20 rounded-md" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
