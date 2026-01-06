'use client'

import NextImage from 'next/image'

type LeaderboardItemProps = {
  rank: number
  userId: string
  userName: string
  userImgSrc: string
  points: number
  isCurrentUser?: boolean
}

export function LeaderboardItem({
  rank,
  userName,
  userImgSrc,
  points,
  isCurrentUser = false,
}: LeaderboardItemProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return 'text-muted-foreground'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div
      className={`flex items-center gap-3 md:gap-4 rounded-lg p-3 md:p-4 transition-colors hover:bg-muted/50 ${
        isCurrentUser ? 'bg-primary/10 ring-2 ring-primary/50' : ''
      }`}
    >
      <div className={`min-w-[2.5rem] md:min-w-[3rem] text-center text-lg md:text-2xl font-bold ${getRankColor(rank)}`}>
        {getRankBadge(rank)}
      </div>
      <div className="relative size-10 md:size-12 overflow-hidden rounded-full border-2 border-border">
        <NextImage src={userImgSrc} alt={userName} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
          {userName}
          {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
        </p>
        <p className="text-sm text-muted-foreground">{points.toLocaleString()} XP</p>
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-muted/50 p-4">
          <div className="h-8 w-12 rounded bg-muted" />
          <div className="size-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

type LeaderboardListProps = {
  users: Array<{
    userId: string
    userName: string
    userImgSrc: string
    points: number
  }>
  currentUserId?: string
}

export function LeaderboardList({ users, currentUserId }: LeaderboardListProps) {
  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <LeaderboardItem
          key={user.userId}
          rank={index + 1}
          {...user}
          isCurrentUser={user.userId === currentUserId}
        />
      ))}
      {users.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>No users found. Be the first to join the leaderboard!</p>
        </div>
      )}
    </div>
  )
}
