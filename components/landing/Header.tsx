"use client"

import Image from 'next/image'
import NextLink from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

import LogoSVG from '@/public/logo.svg'
import GithubSVG from '@/public/img/github.svg'

export function Header() {
  const { authUser, isAuthLoading, profile, isProfileLoading } = useUserProfile()
  const isLoading = isAuthLoading || (authUser && isProfileLoading)
  const isAuthenticated = !!authUser

  const displayName = profile?.progress?.userName ?? profile?.user.name ?? authUser?.name ?? 'Learner'
  const displayAvatar = profile?.progress?.userImgSrc ?? profile?.user.picture ?? authUser?.picture

  return (
    <header className="relative flex justify-center">
      <div className="z-1 flex w-full items-center justify-between gap-2 px-2 sm:px-8">
        <div className="flex flex-1 items-center justify-start gap-1 max-sm:hidden">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/GauravKarakoti/BrainBytes"
              target="_blank"
              aria-label="GitHub repo"
              title="Github repo"
            >
              <GithubSVG className="size-6" />
            </a>
          </Button>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <NextLink
          href="/"
          className="focus-visible group flex h-16 w-14 flex-col items-center gap-1 rounded-b-3xl bg-secondary/30 px-[6px] pt-2 text-2xl transition-colors hover:bg-primary/25 dark:bg-card dark:hover:bg-border/70 sm:size-32 sm:rounded-b-4xl sm:pt-4 sm:text-3xl lg:w-36 lg:text-4xl"
          title="BrainBytes app"
        >
          <span className="flex flex-1 w-full items-center justify-center">
            <LogoSVG className="h-10 w-auto max-sm:h-8 sm:h-16" aria-hidden="true" />
          </span>
          <span className="font-display -tracking-widest">BrainBytes</span>
        </NextLink>
        <div className="flex flex-1 items-center justify-end">
          {isLoading ? (
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <NextLink href="/learn">Dashboard</NextLink>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/api/auth/logout">Logout</a>
              </Button>
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="size-9 rounded-full border border-border object-cover"
                />
              ) : null}
            </div>
          ) : (
            <Button variant="ghost" asChild>
              <a href="/api/auth/login">Login</a>
            </Button>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <ThemeToggle className="size-12 border border-solid border-border bg-card/40 backdrop-blur-lg"></ThemeToggle>
      </div>
    </header>
  )
}
