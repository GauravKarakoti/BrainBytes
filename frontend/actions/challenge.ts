'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'

import { db } from '@/db/drizzle'
import { challengeProgress as challengeProgressSchema, userProgress } from '@/db/schema'

export async function upsertChallengeProgress(challengeId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgressSchema.userId, userId),
      eq(challengeProgressSchema.challengeId, challengeId)
    ),
  })

  if (existingProgress) {
    await db
      .update(challengeProgressSchema)
      .set({
        completed: true,
      })
      .where(
        and(
          eq(challengeProgressSchema.userId, userId),
          eq(challengeProgressSchema.challengeId, challengeId)
        )
      )
  } else {
    await db.insert(challengeProgressSchema).values({
      userId,
      challengeId,
      completed: true,
    })
  }

  revalidateTag(`get_user_progress::${userId}`)
  revalidatePath('/learn')
}

export async function reduceHearts() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const existingUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (!existingUserProgress) {
    throw new Error('User progress not found')
  }

  if (existingUserProgress.hearts === 0) {
    return { error: 'hearts' }
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(existingUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId))

  revalidateTag(`get_user_progress::${userId}`)
  revalidatePath('/learn')
  revalidatePath('/lesson')

  return { success: true }
}
