import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  
  return (
    <div className="flex h-full w-full flex-col gap-6 rounded-xl p-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
