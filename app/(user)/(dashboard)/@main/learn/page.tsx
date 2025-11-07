import NextLink from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { MoveLeft, Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Unit } from '@/components/user/learn/Unit'

import { getUserProgress } from '@/db/queries/userProgress'
import { getUnits, getCourseProgress } from '@/db/queries/units'
import { getLessonPercentage } from '@/db/queries/lessons'

export default async function Learn() {
  const { userId } = await auth()

  const userProgressPromise = getUserProgress(userId)
  const courseProgressPromise = getCourseProgress(userId)
  const unitsPromise = getUnits(userId)
  const lessonPercentagePromise = getLessonPercentage(userId)

  const [userProgress, courseProgress] = await Promise.all([
    userProgressPromise,
    courseProgressPromise,
  ])
  const { activeCourse } = userProgress ?? {}

  if (!activeCourse) {
    redirect('/courses')
  }

  const { activeLessonId } = courseProgress ?? {}

  const [units, percentage] = await Promise.all([unitsPromise, lessonPercentagePromise])

  // Check if all lessons are completed
  const allLessonsCompleted = !activeLessonId && units.length > 0

  return (
    <div className="">
      <div className="sticky top-0 mb-5 flex items-center justify-between border-b-2 bg-background pb-2 text-muted-foreground sm:z-50">
        <Button variant="ghost" size="icon" className="text-inherit" asChild>
          <NextLink href="/courses">
            <MoveLeft className="size-6" strokeWidth={2} />
          </NextLink>
        </Button>
        <h1 className="text-lg font-bold uppercase">{activeCourse.title}</h1>
      </div>

      {allLessonsCompleted ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 rounded-xl border-2 bg-card p-8 text-center">
          <div className="flex items-center gap-3">
            <Trophy className="size-16 text-yellow-500" />
            <Star className="size-12 text-yellow-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Congratulations!</h2>
            <p className="text-xl text-muted-foreground">
              You&apos;ve completed all lessons in {activeCourse.title}!
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="primary" asChild>
              <NextLink href="/courses">
                Explore Other Courses
              </NextLink>
            </Button>
            <Button variant="secondary" asChild>
              <NextLink href="/learn">
                Review Lessons
              </NextLink>
            </Button>
          </div>
        </div>
      ) : null}

      {units.map(({ lessons, ...unit }) => (
        <Unit
          key={unit.id}
          unit={unit}
          lessons={lessons}
          activeLessonId={activeLessonId}
          activeLessonPercentage={percentage}
          // TODO: map over variants array
          variant="primary"
        />
      ))}
    </div>
  )
}
