// Quests Configuration
export const QUESTS = [
  {
    id: 1,
    title: 'Daily Streak',
    description: 'Complete at least 3 lessons every day',
    icon: '🔥',
    target: 3,
    reward: {
      points: 20,
      gems: 0,
    },
    type: 'daily' as const,
  },
  {
    id: 2,
    title: 'Problem Solver',
    description: 'Solve 10 coding challenges',
    icon: '🧩',
    target: 10,
    reward: {
      points: 50,
      gems: 5,
    },
    type: 'progress' as const,
  },
  {
    id: 3,
    title: 'Perfect Score',
    description: 'Complete a lesson without any mistakes',
    icon: '🎯',
    target: 1,
    reward: {
      points: 30,
      gems: 3,
    },
    type: 'challenge' as const,
  },
  {
    id: 4,
    title: 'Array Master',
    description: 'Complete all Array lessons',
    icon: '📊',
    target: 1,
    reward: {
      points: 100,
      gems: 10,
    },
    type: 'milestone' as const,
  },
  {
    id: 5,
    title: 'Weekly Warrior',
    description: 'Complete 20 lessons this week',
    icon: '⚔️',
    target: 20,
    reward: {
      points: 150,
      gems: 15,
    },
    type: 'weekly' as const,
  },
  {
    id: 6,
    title: 'Speed Demon',
    description: 'Complete 5 lessons in one day',
    icon: '⚡',
    target: 5,
    reward: {
      points: 40,
      gems: 5,
    },
    type: 'daily' as const,
  },
  {
    id: 7,
    title: 'Points Collector',
    description: 'Earn 1000 total points',
    icon: '💯',
    target: 1000,
    reward: {
      points: 0,
      gems: 20,
    },
    type: 'milestone' as const,
  },
  {
    id: 8,
    title: 'Social Coder',
    description: 'Rank in top 10 on leaderboard',
    icon: '🏆',
    target: 10,
    reward: {
      points: 200,
      gems: 25,
    },
    type: 'milestone' as const,
  },
] as const

export type Quest = (typeof QUESTS)[number]
export type QuestType = 'daily' | 'weekly' | 'progress' | 'challenge' | 'milestone'

// Helper function to calculate quest progress
export function calculateProgress(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100)
}
