'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'

import { db } from '@/db/drizzle'
import {
  challengeProgress as challengeProgressSchema,
  userProgress,
  challenges, // <-- Add 'challenges' here
} from '@/db/schema'

// 3. Import new quest actions
import {
  updateQuestProgress,
  checkMilestoneQuests,
} from '@/actions/quest'

const POINTS_PER_CHALLENGE = 10

export async function upsertChallengeProgress(challengeId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgressSchema.userId, userId),
      eq(challengeProgressSchema.challengeId, challengeId),
    ),
  })

  // 4. Get the challenge to find its lessonId
  const challenge = await db.query.challenges.findFirst({
    // Use challengeProgressSchema here as it's in scope for this query
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
      // Already completed, do nothing (or maybe allow practice?)
      return { error: 'already_completed' }
    }

    // Update existing progress to completed
    await db
      .update(challengeProgressSchema)
      .set({
        completed: true,
      })
      .where(eq(challengeProgressSchema.id, existingProgress.id))
  } else {
    // Create new progress
    await db.insert(challengeProgressSchema).values({
      userId,
      challengeId,
      completed: true,
    })
  }

  // 5. Award points if it wasn't already completed
  if (!isCompleted) {
    await db
      .update(userProgress)
      .set({
        points: sql`${userProgress.points} + ${POINTS_PER_CHALLENGE}`,
      })
      .where(eq(userProgress.userId, userId))

    // --- Quest Integration ---
    // 6. Update 'progress' type quests (e.g., "Solve 10 challenges")
    await updateQuestProgress(userId, 'progress', 1)

    // 7. Check for lesson completion
    const lessonChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, challenge.lessonId), // Now 'challenges' is defined
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
      // 8. Update 'daily' and 'weekly' quests (e.g., "Complete 3 lessons")
      // We check both, as a daily quest also counts towards a weekly one
      await updateQuestProgress(userId, 'daily', 1)
      await updateQuestProgress(userId, 'weekly', 1)
      // You could also add 'milestone' quests for specific lessons/units here
      // e.g., if (challenge.lesson.unit.title === 'Array Master') ...
    }

    // 9. Check milestone quests (e.g., "Earn 1000 total points")
    await checkMilestoneQuests(userId)
    // --- End Quest Integration ---
  }

  revalidateTag(`get_user_progress::${userId}`)
  revalidateTag('get_user_progress')
  revalidatePath('/learn')
  revalidatePath('/lesson') // Revalidate lesson page
  revalidateTag(`get_lesson`) // Revalidate lesson data
  revalidateTag(`get_quests::${userId}`) // Revalidate quest data

  return { success: true }
}

export async function reduceHearts() {
  // ... (rest of the function remains unchanged)
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