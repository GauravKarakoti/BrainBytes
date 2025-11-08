import { redirect } from 'next/navigation'
import { Trophy, Target } from 'lucide-react'
import { QuestGrid } from '@/components/user/quests/QuestGrid'
import { getUserProgress } from '@/db/queries/userProgress'
import { getQuests } from '@/actions/quest'
import { getOptionalUser } from '@/lib/auth0'

export default async function Quests() {
  const user = await getOptionalUser()

  if (!user) {
    redirect('/')
  }

  const userId = user.id

  const [userProgress, allQuests] = await Promise.all([
    getUserProgress(userId),
    getQuests(userId),
  ])

  if (!userProgress) {
    redirect('/courses')
  }

  const dailyQuests = allQuests.filter((q) => q.type === 'daily')
  const weeklyQuests = allQuests.filter((q) => q.type === 'weekly')
  const milestones = allQuests.filter((q) => q.type === 'milestone')
  const otherQuests = allQuests.filter(
    (q) => !['daily', 'weekly', 'milestone'].includes(q.type),
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6">
      <div className="flex items-center gap-3">
        <Target className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Quests & Milestones</h1>
          <p className="text-muted-foreground">
            Complete challenges to earn rewards and track your progress!
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <p className="text-3xl font-bold text-primary">
            {userProgress.points} XP
          </p>
        </div>
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Gems Collected</p>
          <p className="text-3xl font-bold text-secondary">
            💎 {userProgress.gems}
          </p>
        </div>
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Hearts</p>
          <p className="text-3xl font-bold text-rose-500">
            ❤️ {userProgress.hearts}
          </p>
        </div>
      </div>

      {dailyQuests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Daily Quests</h2>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
              Resets daily
            </span>
          </div>
          <QuestGrid quests={dailyQuests} />
        </section>
      )}

      {weeklyQuests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Weekly Challenges</h2>
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-500">
              Resets weekly
            </span>
          </div>
          <QuestGrid quests={weeklyQuests} />
        </section>
      )}

      {milestones.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Milestones</h2>
          </div>
          <QuestGrid quests={milestones} />
        </section>
      )}

      {otherQuests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Other Challenges</h2>
          <QuestGrid quests={otherQuests} />
        </section>
      )}
    </div>
  )
}