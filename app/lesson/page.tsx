import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getLesson, getLessonPercentage } from '@/db/queries/lessons'
import { getUserProgress } from '@/db/queries/userProgress'
import { getCourseProgress } from '@/db/queries/units'
import { LessonClient } from './LessonClient'

export default async function LessonPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

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
