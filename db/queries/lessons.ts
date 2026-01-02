'use server'

import { cache } from 'react'

import { db } from '@/db/drizzle'
import { getCourseProgress } from '@/db/queries/units'

import {
  lessons,
  challengeProgress as challengeProgressSchema,
} from '@/db/schema'

import type {
  LessonType,
  ChallengeType,
  ChallengeOptionType,
  ChallengeProgressType,
} from '@/db/schema'
import { eq } from 'drizzle-orm'

type ChallengeQueryType = ChallengeType & {
  challengeOptions: ChallengeOptionType[]
  challengeProgress: ChallengeProgressType[]
}

type ChallengeWithProgress = ChallengeQueryType & {
  completed: boolean
}

export type LessonWithChallenges = LessonType & {
  challenges: ChallengeWithProgress[]
}

export const getLesson = cache(
  async (userId: string | null, id?: number): Promise<LessonWithChallenges | null> => {
    const courseProgress = await getCourseProgress(userId)

    const lessonId = id || courseProgress?.activeLessonId

    if (!lessonId || !userId) return null

    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: {
          orderBy: (challenges, { asc }) => [asc(challenges.order)],
          with: {
            challengeOptions: true,
            challengeProgress: {
              where: eq(challengeProgressSchema.userId, userId),
            },
          },
        },
      },
    })

    if (!data?.challenges) return null

    const challengesWithProgress: ChallengeWithProgress[] = (
      data.challenges as ChallengeQueryType[]
    ).map((challenge) => ({
      ...challenge,
      completed:
        !!challenge.challengeProgress.length &&
        challenge.challengeProgress.every((c) => c.completed),
    }))

    return {
      ...data,
      challenges: challengesWithProgress,
    }
  }
)

export const getLessonPercentage = cache(async (userId: string | null) => {
  const { activeLessonId } = (await getCourseProgress(userId)) ?? {}

  if (!activeLessonId || !userId) return 0

  const lesson = await getLesson(userId, activeLessonId)

  if (!lesson) return 0

  const completedChallenges = lesson.challenges.filter((c) => c.completed)

  if (lesson.challenges.length === 0) {
    return 0
  }

  return Math.round((completedChallenges.length / lesson.challenges.length) * 100)
})