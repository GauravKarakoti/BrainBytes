'use server'

import { unstable_cache as NextCache } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

import { db } from '@/db/drizzle'

export const getUserProgress = async (userId?: string | null) => {
  if (userId === null) return null

  let _userId = userId

  if (!_userId) {
    const { userId: _uid } = await auth()
    if (!_uid) return null
    _userId = _uid
  }

  return NextCache(
    async (_uid: string) => {
      return await db.query.userProgress.findFirst({
        where: ({ userId: uid }, { eq }) => eq(uid, _uid),
        with: { activeCourse: true },
      })
    },
    ['get_user_progress', _userId as string],
    { revalidate: 180, tags: ['get_user_progress', `get_user_progress::${_userId}`] }
  )(_userId as string)
}

export const getUserSubscription = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
  });

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
