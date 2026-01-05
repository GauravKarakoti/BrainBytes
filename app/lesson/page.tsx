import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getLesson, getLessonPercentage } from '@/db/queries/lessons'
import { getUserProgress } from '@/db/queries/userProgress'
import { getCourseProgress } from '@/db/queries/units'
import { LessonClient } from './LessonClient'
import { requireUser } from '@/lib/auth0'
import LoadingIndicator from '@/components/LoadingIndicator'

async function LessonContent() {
  const user = await requireUser()
  const userId = user.id

  const courseProgress = await getCourseProgress(userId)

  if (!courseProgress?.activeLessonId) {
    redirect('/learn')
  }

  const [lesson, userProgress, percentage] = await Promise.all([
    getLesson(userId),
    getUserProgress(userId),
    getLessonPercentage(userId),
  ])

  if (!lesson || !userProgress) {
    redirect('/learn')
  }

  return (
    <LessonClient
      lesson={lesson}
      initialHearts={userProgress.hearts}
      initialPercentage={percentage}
    />
  )
}

export default function LessonPage() {
  return (
    <Suspense fallback={<LoadingIndicator message="Loading lesson…" />}>
      <LessonContent />
    </Suspense>
  )
}
