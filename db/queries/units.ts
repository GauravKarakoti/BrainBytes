'use server'

import { cache } from 'react'

import { db } from '@/db/drizzle'
import { getUserProgress } from '@/db/queries/userProgress'

export const getUnits = cache(async (userId: string | null) => {
  const { activeCourseId } = (await getUserProgress(userId)) ?? {}

  if (!activeCourseId || !userId) return []

  const data = await db.query.units.findMany({
    where: ({ courseId }, { eq }) => eq(courseId, activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: { where: ({ userId: _userId }:any, { eq }:any) => eq(_userId, userId) },
            },
          },
        },
      },
    },
  })
  
  const normalizedData = data.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const completed =
        !!lesson.challenges.length &&
        lesson.challenges.every(
          ({ challengeProgress }:any) =>
            !!challengeProgress.length && challengeProgress.every(({ completed }:any) => completed)
        )
      
      return {
        id: lesson.id,
        title: lesson.title,
        unitId: lesson.unitId,
        order: lesson.order,
        completed: completed,
      }
    }),
  }))

  return normalizedData
})

export const getCourseProgress = cache(async (userId: string | null) => {
  const { activeCourseId } = (await getUserProgress(userId)) ?? {}

  if (!activeCourseId || !userId) return null

  const unitsInActiveCourse = await db.query.units.findMany({
    where: ({ courseId }, { eq }) => eq(courseId, activeCourseId),
    orderBy: ({ order }, { asc }) => [asc(order)],
    with: {
      lessons: {
        orderBy: ({ order }, { asc }) => [asc(order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: ({ userId: _userId }:any, { eq }:any) => eq(_userId, userId),
              },
            },
          },
        },
      },
    },
  })

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) =>
      lesson.challenges.some(
        ({ challengeProgress }:any) =>
          !challengeProgress ||
          challengeProgress.length === 0 ||
          challengeProgress.some(({ completed }:any) => !completed)
      )
    )

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  }
})