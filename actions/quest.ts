'use server'
import { getLevelFromPoints } from '@/config/levels'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db/drizzle'
import {
  quests,
  userQuestProgress,
  questTypeEnum,
} from '@/db/schema/quests'
import { userProgress } from '@/db/schema/userProgress'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

export const getQuests = async (userId?: string | null) => {
  if (userId === null) return []

  let finalUserId: string

  if (userId) {
    finalUserId = userId
  } else {
    const { userId: _uid } = await auth()
    if (!_uid) return [] 
    finalUserId = _uid
  }

  const data = await db.query.quests.findMany({
    with: {
      userQuestProgress: {
        where: eq(userQuestProgress.userId, finalUserId),
      },
    },
  })

  return data
}

export const updateQuestProgress = async (
  userId: string,
  questType: (typeof questTypeEnum.enumValues)[number],
  increment: number = 1,
) => {
  try {
    const questsToUpdate = await db.query.quests.findMany({
      where: eq(quests.type, questType),
    })

    if (!questsToUpdate.length) {
      return
    }

    const questsToUpdateIds = questsToUpdate.map((q) => q.id)

    const currentUserProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })

    if (!currentUserProgress) {
      throw new Error('User progress not found')
    }

    const currentQuestProgresses = await db.query.userQuestProgress.findMany({
      where: and(
        eq(userQuestProgress.userId, userId),
        inArray(userQuestProgress.questId, questsToUpdateIds),
      ),
    })

    let totalPointsReward = 0
    let totalGemsReward = 0

    for (const quest of questsToUpdate) {
      let progress = currentQuestProgresses.find(
        (p) => p.questId === quest.id,
      )

      if (!progress) {
        const [newProgress] = await db
          .insert(userQuestProgress)
          .values({
            userId,
            questId: quest.id,
            currentProgress: 0,
            completed: false,
          })
          .returning()
        progress = newProgress
      }

      if (progress.completed) {
        continue
      }

      const newProgressValue = progress.currentProgress + increment

      // Check if target is met
      if (newProgressValue >= quest.target) {
        // Target met: Mark as complete and add rewards
        await db
          .update(userQuestProgress)
          .set({
            currentProgress: quest.target, // Cap at target
            completed: true,
            lastCompletedAt: new Date(),
          })
          .where(eq(userQuestProgress.id, progress.id))

        totalPointsReward += quest.rewardPoints
        totalGemsReward += quest.rewardGems
      } else {
        await db
          .update(userQuestProgress)
          .set({
            currentProgress: newProgressValue,
          })
          .where(eq(userQuestProgress.id, progress.id))
      }
    }

    if (totalPointsReward > 0 || totalGemsReward > 0) {
      const newPoints = currentUserProgress.points + totalPointsReward
      const newGems = currentUserProgress.gems + totalGemsReward
      const newLevelData = getLevelFromPoints(newPoints)

      await db
        .update(userProgress)
        .set({
          points: newPoints,
          gems: newGems,
          level: newLevelData.level,
        })
        .where(eq(userProgress.userId, userId))
    }

    revalidateTag(`get_user_progress::${userId}`)
    revalidateTag('get_user_progress')
    revalidateTag(`get_quests::${userId}`)
    revalidateTag('get_quests')
  } catch (error) {
    console.error('Failed to update quest progress:', error)
  }
}

export const checkMilestoneQuests = async (userId: string) => {
  try {
    const questsToUpdate = await db.query.quests.findMany({
      where: eq(quests.type, 'milestone'),
    })

    if (!questsToUpdate.length) return

    const currentUserProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    })

    if (!currentUserProgress) {
      throw new Error('User progress not found')
    }

    const currentQuestProgresses = await db.query.userQuestProgress.findMany({
      where: and(
        eq(userQuestProgress.userId, userId),
        inArray(
          userQuestProgress.questId,
          questsToUpdate.map((q) => q.id),
        ),
      ),
    })

    let totalPointsReward = 0
    let totalGemsReward = 0

    for (const quest of questsToUpdate) {
      let progress = currentQuestProgresses.find(
        (p) => p.questId === quest.id,
      )
      if (!progress) {
        const [newProgress] = await db
          .insert(userQuestProgress)
          .values({
            userId,
            questId: quest.id,
            currentProgress: 0,
            completed: false,
          })
          .returning()
        progress = newProgress
      }

      if (progress.completed) {
        continue
      }

      const currentMilestoneProgress = currentUserProgress.points
      const isComplete = currentMilestoneProgress >= quest.target

      await db
        .update(userQuestProgress)
        .set({
          currentProgress: Math.min(currentMilestoneProgress, quest.target),
          completed: isComplete,
          ...(isComplete && { lastCompletedAt: new Date() }),
        })
        .where(eq(userQuestProgress.id, progress.id))

      if (isComplete && !progress.completed) { 
        totalPointsReward += quest.rewardPoints
        totalGemsReward += quest.rewardGems
      }
    }

    if (totalPointsReward > 0 || totalGemsReward > 0) {
      const newPoints = currentUserProgress.points + totalPointsReward
      const newGems = currentUserProgress.gems + totalGemsReward
      const newLevelData = getLevelFromPoints(newPoints)

      await db
        .update(userProgress)
        .set({
          points: newPoints,
          gems: newGems,
          level: newLevelData.level,
        })
        .where(eq(userProgress.userId, userId))
    }

    revalidateTag(`get_user_progress::${userId}`)
    revalidateTag('get_user_progress')
    revalidateTag(`get_quests::${userId}`)
    revalidateTag('get_quests')
  } catch (error) {
    console.error('Failed to check milestone quests:', error)
  }
}

export const resetDailyQuests = async () => {
  try {
    const dailyQuests = await db.query.quests.findMany({
      where: eq(quests.type, 'daily'),
      columns: { id: true },
    })

    if (!dailyQuests.length) {
      console.log('No daily quests to reset.')
      return
    }

    const dailyQuestIds = dailyQuests.map((q) => q.id)

    await db
      .update(userQuestProgress)
      .set({
        currentProgress: 0,
        completed: false,
        lastCompletedAt: null,
      })
      .where(inArray(userQuestProgress.questId, dailyQuestIds))

    console.log(`Reset ${dailyQuestIds.length} daily quests for all users.`)
    revalidateTag('get_quests')
  } catch (error) {
    console.error('Failed to reset daily quests:', error)
  }
}

export const resetWeeklyQuests = async () => {
  try {
    const weeklyQuests = await db.query.quests.findMany({
      where: eq(quests.type, 'weekly'),
      columns: { id: true },
    })

    if (!weeklyQuests.length) {
      console.log('No weekly quests to reset.')
      return
    }

    const weeklyQuestIds = weeklyQuests.map((q) => q.id)

    await db
      .update(userQuestProgress)
      .set({
        currentProgress: 0,
        completed: false,
        lastCompletedAt: null,
      })
      .where(inArray(userQuestProgress.questId, weeklyQuestIds))

    console.log(`Reset ${weeklyQuestIds.length} weekly quests for all users.`)
    revalidateTag('get_quests')
  } catch (error) {
    console.error('Failed to reset weekly quests:', error)
  }
}