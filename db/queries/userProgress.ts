'use server'

import { unstable_cache as NextCache } from 'next/cache'
import { db } from '@/db/drizzle'
import { getOptionalUser } from '@/lib/auth0'
import type { UserProgressType, CourseType } from '@/db/schema'

type UserProgressWithCourse = UserProgressType & {
  activeCourse: CourseType | null
}

export const getUserProgress = async (userId?: string | null): Promise<UserProgressWithCourse | null | undefined> => {
  if (userId === null) return null

  let _userId = userId

  if (!_userId) {
    const user = await getOptionalUser()
    if (!user) return null
    _userId = user.id
  }

  return NextCache(
    async (_uid: string): Promise<UserProgressWithCourse | undefined> => {
      const data = await db.query.userProgress.findFirst({
        where: ({ userId: uid }, { eq }) => eq(uid, _uid),
        with: { activeCourse: true },
      })

      return data as UserProgressWithCourse | undefined
    },
    ['get_user_progress', _userId as string],
    { revalidate: 180, tags: ['get_user_progress', `get_user_progress::${_userId}`] }
  )(_userId as string)
}

export const getUserSubscription = async (userId?: string | null) => {
  let _userId = userId

  if (!_userId) {
    const user = await getOptionalUser()
    if (!user) return null
    _userId = user.id
  }

  const data = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, _userId as string),
  })

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd &&
    data.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
};