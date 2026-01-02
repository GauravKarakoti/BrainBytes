'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { getCourseById } from '@/db/queries/courses'
import { getUserProgress } from '@/db/queries/userProgress'

import { BaseError, GenericError, ServerError } from '@/lib/errors'
import { requireUser } from '@/lib/auth0'

const FALLBACK_NAME = 'Learner'
const FALLBACK_AVATAR = '/logo.svg'

export async function selectCourse(courseId: number) {
  try {
    const user = await requireUser()
    const userId = user.id

    const course = await getCourseById(courseId)

    if (!course) {
      throw new ServerError('This course is unavailable.')
    }

    // Check if the course has any lessons
    const units = await db.query.units.findMany({
      where: (table, { eq }) => eq(table.courseId, courseId),
      with: {
        lessons: true,
      },
    })

    const hasLessons = units.some((unit) => unit.lessons.length > 0)

    if (!hasLessons) {
      throw new ServerError('This course has no lessons yet.')
    }

    const currentUserProgress = await getUserProgress(userId)

    const selection = {
      activeCourseId: courseId,
    }

    if (currentUserProgress) {
      console.log('[selectCourse] Updating existing user progress for userId:', userId)
      await db.update(userProgress).set(selection).where(eq(userProgress.userId, userId))
    } else {
      console.log('[selectCourse] Creating new user progress for userId:', userId)
      await db.insert(userProgress).values({
        ...selection,
        userId,
        userName: user.name ?? FALLBACK_NAME,
        userImgSrc: user.picture ?? FALLBACK_AVATAR,
      })
    }

    console.log('[selectCourse] Successfully saved course selection:', courseId)
  } catch (error) {
    console.error('[selectCourse] Error:', error)
    if (error instanceof BaseError) throw error
    throw new GenericError('Something went wrong!:\n', { cause: error })
  }

  revalidateTag('get_user_progress')
  revalidatePath('/courses')
  revalidatePath('/learn')
  redirect('/learn')
}
