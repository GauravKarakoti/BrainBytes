import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function LearnLoading() {
  return (
    <div className="">
      <div className="sticky top-0 mb-5 flex items-center justify-between border-b-2 bg-background pb-2 text-muted-foreground sm:z-50">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
      </div>

      {Array.from({ length: 3 }).map((_, unitIndex) => (
        <section key={unitIndex} className="space-y-10 pb-16">
          <header className="flex w-full items-center justify-between rounded-xl p-5">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-10 w-20" />
          </header>
          <ul className="flex flex-col items-center space-y-5">
            {Array.from({ length: 5 }).map((_, lessonIndex) => (
              <li key={lessonIndex}>
                <div className="relative">
                  <Skeleton className="h-16 w-64" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
