'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { byteTokenContract, B_DECIMALS } from '@/lib/ethers'
import { ethers } from 'ethers'
import { db } from '@/db/drizzle'
import {
  challengeProgress as challengeProgressSchema,
  userProgress,
  challenges,
} from '@/db/schema'
import { getLevelFromPoints } from '@/config/levels'
import {
  updateQuestProgress,
  checkMilestoneQuests,
} from '@/actions/quest'

const POINTS_PER_CHALLENGE = 10
const TOKENS_PER_CHALLENGE = 5;

export async function upsertChallengeProgress(challengeId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!currentUserProgress) {
    throw new Error('User progress not found');
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgressSchema.userId, userId),
      eq(challengeProgressSchema.challengeId, challengeId),
    ),
  })

  const challenge = await db.query.challenges.findFirst({
    where: eq(challengeProgressSchema.challengeId, challengeId),
    columns: {
      lessonId: true,
    },
  })

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  const isCompleted = !!existingProgress?.completed

  if (existingProgress) {
    if (isCompleted) {
      return { error: 'already_completed' }
    }

    await db
      .update(challengeProgressSchema)
      .set({
        completed: true,
      })
      .where(eq(challengeProgressSchema.id, existingProgress.id))
  } else {
    await db.insert(challengeProgressSchema).values({
      userId,
      challengeId,
      completed: true,
    })
  }

  if (!isCompleted) {
    const currentPoints = currentUserProgress.points
    const newPoints = currentPoints + POINTS_PER_CHALLENGE
    const newLevelData = getLevelFromPoints(newPoints)

    await db
      .update(userProgress)
      .set({
        points: newPoints,
        level: newLevelData.level,
      })
      .where(eq(userProgress.userId, userId))

    if (currentUserProgress.walletAddress) {
      try {
        const amount = ethers.parseUnits(TOKENS_PER_CHALLENGE.toString(), B_DECIMALS);
        const tx = await byteTokenContract.mint(currentUserProgress.walletAddress, amount);
        console.log(`Minting ${TOKENS_PER_CHALLENGE} BYTE to ${currentUserProgress.walletAddress}, tx: ${tx.hash}`);
      } catch (error) {
        console.error("Failed to mint BYTE tokens:", error);
      }
    }

    await updateQuestProgress(userId, 'progress', 1)

    const lessonChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, challenge.lessonId),
      with: {
        challengeProgress: {
          where: and(
            eq(challengeProgressSchema.userId, userId),
            eq(challengeProgressSchema.completed, true),
          ),
        },
      },
    })

    const allChallengesInLessonCompleted = lessonChallenges.every(
      (c) => c.challengeProgress.length > 0,
    )

    if (allChallengesInLessonCompleted) {
      await updateQuestProgress(userId, 'daily', 1)
      await updateQuestProgress(userId, 'weekly', 1)
    }

    await checkMilestoneQuests(userId)
  }

  revalidateTag(`get_user_progress::${userId}`)
  revalidateTag('get_user_progress')
  revalidatePath('/learn')
  revalidatePath('/lesson') 
  revalidateTag(`get_lesson`)
  revalidateTag(`get_quests::${userId}`) 

  return { success: true }
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