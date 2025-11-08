import { Suspense } from 'react'
import { Trophy } from 'lucide-react'
import { LeaderboardList, LeaderboardSkeleton } from '@/components/user/leaderboard/LeaderboardList'
import { getTopUsers, getUserRank } from '@/db/queries/leaderboard'
import { getUserProgress } from '@/db/queries/userProgress'
import { getOptionalUser } from '@/lib/auth0'

export default async function Leaderboard() {
  const user = await getOptionalUser()
  const userId = user?.id ?? null
  
  const [topUsers, userProgress, userRank] = await Promise.all([
    getTopUsers(),
    getUserProgress(userId),
    getUserRank(userId),
  ])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Trophy className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other coders!</p>
        </div>
      </div>

      {userProgress && userRank && (
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold text-primary">#{userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Points</p>
              <p className="text-2xl font-bold">{userProgress.points.toLocaleString()} XP</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border-2 bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">Top Coders</h2>
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardList users={topUsers} currentUserId={userId || undefined} />
        </Suspense>
      </div>
    </div>
  )
}
