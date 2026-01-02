import NextLink from 'next/link'
import NextImage from 'next/image'
import { InfinityIcon, Ban } from 'lucide-react'
import { getLevelFromPoints } from '@/config/levels'
import { getUserProgress } from '@/db/queries/userProgress'

type UserProgressProps = {
  hasActiveSubscription?: boolean
  plain?: boolean
}

export async function UserProgress({ hasActiveSubscription, plain }: UserProgressProps) {
  const userProgress = await getUserProgress()
  const { points = 0, hearts = 0, activeCourse } = userProgress ?? {}
  const { level, title: levelTitle } = getLevelFromPoints(points)
  const { title = 'Select course', altCode } = activeCourse ?? {}

  return (
    <div className="flex h-full min-h-[220px] w-full max-h-[calc(100vh-3rem)] flex-col justify-evenly text-sm">
      <NextLink
        href="/courses"
        className={`${plain ? 'text-inherit hover:opacity-80' : 'text-foreground/85 hover:text-foreground'} flex items-center gap-x-3 transition-colors`}
      >
        {altCode ? (
          <NextImage
            src={`/img/flags/${altCode}.png`}
            alt={title}
            width={40}
            height={40}
            className="rounded-md border border-border/80 dark:border-muted-foreground"
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-md border border-border/80 text-border">
            <Ban className="size-5" />
            <span className="sr-only">{title}</span>
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide opacity-70">Course</span>
          <span className="font-semibold leading-tight">{title}</span>
        </div>
      </NextLink>
      <NextLink
        href="/shop"
  className={`${plain ? 'text-inherit hover:opacity-80' : 'text-orange-500 hover:text-orange-400'} flex items-center gap-x-3 transition-colors`}
      >
  <NextImage src="/img/icons/xp.svg" alt="points" width={40} height={40} />
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide opacity-70">XP</span>
          <span className="font-semibold leading-tight">{points}</span>
        </div>
      </NextLink>
      <div
        className={`hidden flex-col gap-y-1 text-xs font-semibold ${
          plain ? 'text-inherit' : 'text-muted-foreground'
        } lg:flex`}
      >
        <span className="text-xs uppercase tracking-wide opacity-70">Rank</span>
        <span className="text-base font-semibold leading-tight">{levelTitle}</span>
        <span className="opacity-70">Lvl {level}</span>
      </div>
      <NextLink
        href="/shop"
  className={`${plain ? 'text-inherit hover:opacity-80' : 'text-rose-500 hover:text-rose-400'} flex items-center gap-x-3 transition-colors`}
      >
  <NextImage src="/img/icons/heart.svg" alt="hearts" width={40} height={40} />
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide opacity-70">Hearts</span>
          <span className="font-semibold leading-tight">
            {hasActiveSubscription ? <InfinityIcon className="size-4" strokeWidth={3} /> : hearts}
          </span>
        </div>
      </NextLink>
    </div>
  )
}
