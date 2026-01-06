'use client'

import {
  type Quest,
  type UserQuestProgress,
} from '@/db/schema/quests'
import { calculateProgress } from '@/config/quests'

type QuestWithProgress = Quest & {
  userQuestProgress: UserQuestProgress[]
}

type QuestCardProps = {
  quest: QuestWithProgress
}

export function QuestCard({ quest }: QuestCardProps) {
  const progressData = quest.userQuestProgress[0] 
  const currentProgress = progressData?.currentProgress || 0
  const isCompleted = progressData?.completed || false

  const progress = calculateProgress(currentProgress, quest.target)
  const progressText = `${currentProgress}/${quest.target}`

  const getTypeColor = (type: Quest['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'weekly':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'progress':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'challenge':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'milestone':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-card p-4 md:p-6 transition-all hover:shadow-lg ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      {isCompleted && (
        <div className="absolute right-2 top-2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
          ✓ Completed
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="text-3xl md:text-5xl">{quest.icon}</div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getTypeColor(
            quest.type,
          )}`}
        >
          {quest.type}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg md:text-xl font-bold">{quest.title}</h3>
        <p className="text-sm text-muted-foreground">{quest.description}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{progressText}</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 pt-2 text-sm">
          <span className="font-semibold text-primary">
            +{quest.rewardPoints} XP
          </span>
          {quest.rewardGems > 0 && (
            <span className="font-semibold text-secondary">
              +{quest.rewardGems} 💎
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

type QuestGridProps = {
  quests: QuestWithProgress[]
}

export function QuestGrid({ quests }: QuestGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
        />
      ))}
    </div>
  )
}