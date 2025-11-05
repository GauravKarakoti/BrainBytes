'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'

import { db } from '@/db/drizzle'
import { userProgress } from '@/db/schema'
import { getCourseById } from '@/db/queries/courses'
import { getUserProgress } from '@/db/queries/userProgress'

import { BaseError, GenericError, ServerError } from '@/lib/errors'

export async function selectCourse(courseId: number) {
  try {
    const [{ userId }, user] = await Promise.all([auth(), currentUser()])

    if (!userId || !user) {
      throw new ServerError('Login to access course.')
    }

    const course = await getCourseById(courseId)

    if (!course) {
      throw new ServerError('This course is unavailable.')
    }

    const currentUserProgress = await getUserProgress(userId)

    const selection = {
      activeCourseId: courseId,
      userName: user.firstName || 'User',
      userImgSrc: user.imageUrl || '/logo.svg',
    }

    if (currentUserProgress) {
      await db.update(userProgress).set(selection)
    } else {
      await db.insert(userProgress).values({
        ...selection,
        userId,
      })
    }
  } catch (error) {
    if (error instanceof BaseError) throw error
    throw new GenericError('Something went wrong!:\n', { cause: error })
  }

  revalidateTag('get_user_progress')
  revalidatePath('/courses')
  revalidatePath('/learn')
  redirect('/learn')
}
