'use server'

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
import { requireUser } from '@/lib/auth0'

const POINTS_PER_CHALLENGE = 10
const TOKENS_PER_CHALLENGE = 5;

export async function upsertChallengeProgress(challengeId: number) {
  const user = await requireUser()
  const userId = user.id

  console.log('[upsertChallengeProgress] Starting for challenge:', challengeId, 'user:', userId)

  let currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  console.log('[upsertChallengeProgress] Current user progress:', currentUserProgress)

  // If user progress doesn't exist, create a default one
  if (!currentUserProgress) {
    console.log('[upsertChallengeProgress] Creating user progress for user:', userId)
    
    // Get the first available course
    const firstCourse = await db.query.courses.findFirst()
    
    if (!firstCourse) {
      throw new Error('No courses available')
    }

    await db.insert(userProgress).values({
      userId,
      activeCourseId: firstCourse.id,
      userName: user.name,
      userImgSrc: user.picture,
    })

    currentUserProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })

    if (!currentUserProgress) {
      throw new Error('Failed to create user progress')
    }
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgressSchema.userId, userId),
      eq(challengeProgressSchema.challengeId, challengeId),
    ),
  })

  console.log('[upsertChallengeProgress] Existing progress:', existingProgress)

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
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
      console.log('[upsertChallengeProgress] Challenge already completed')
      return { error: 'already_completed' }
    }

    console.log('[upsertChallengeProgress] Updating existing progress')
    await db
      .update(challengeProgressSchema)
      .set({
        completed: true,
      })
      .where(eq(challengeProgressSchema.id, existingProgress.id))
  } else {
    console.log('[upsertChallengeProgress] Creating new progress')
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

    console.log('[upsertChallengeProgress] Updating user progress - points:', newPoints, 'level:', newLevelData.level)

    await db
      .update(userProgress)
      .set({
        points: newPoints,
        level: newLevelData.level,
      })
      .where(eq(userProgress.userId, userId))
    
    console.log("Current User Progress:",currentUserProgress)
    if (currentUserProgress.wallet_address) {
      try {
        const amount = ethers.parseUnits(TOKENS_PER_CHALLENGE.toString(), B_DECIMALS);
        const tx = await byteTokenContract.mint(currentUserProgress.wallet_address, amount);
        console.log(`Minting ${TOKENS_PER_CHALLENGE} BYTE to ${currentUserProgress.wallet_address}, tx: ${tx.hash}`);
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

  console.log('[upsertChallengeProgress] Revalidating paths and tags')
  revalidateTag(`get_user_progress::${userId}`)
  revalidateTag('get_user_progress')
  revalidatePath('/learn')
  revalidatePath('/lesson') 
  revalidateTag(`get_lesson`)
  revalidateTag(`get_quests::${userId}`) 

  console.log('[upsertChallengeProgress] Success!')
  return { success: true }
}

export async function reduceHearts() {
  const user = await requireUser()
  const userId = user.id

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