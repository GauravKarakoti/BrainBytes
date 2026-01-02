export const LEVEL_MILESTONES = [
  { level: 0, title: 'Newbie', minPoints: 0 },
  { level: 1, title: 'Beginner', minPoints: 100 },
  { level: 2, title: 'Apprentice', minPoints: 250 },
  { level: 3, title: 'Explorer', minPoints: 500 },
  { level: 4, title: 'Adept', minPoints: 1000 },
  { level: 5, title: 'Expert', minPoints: 1750 },
  { level: 6, title: 'Master', minPoints: 3000 },
  { level: 7, title: 'Grandmaster', minPoints: 5000 },
  { level: 8, title: 'Legend', minPoints: 10000 },
] as const

export type LevelMilestone = (typeof LEVEL_MILESTONES)[number]

export const getLevelFromPoints = (points: number): LevelMilestone => {
  let currentMilestone: LevelMilestone = LEVEL_MILESTONES[0]

  for (const milestone of LEVEL_MILESTONES) {
    if (points >= milestone.minPoints) {
      currentMilestone = milestone
    } else {
      break
    }
  }
  return currentMilestone
}