import type { ReactNode } from 'react'

type DashboardLayoutProps = {
  main: ReactNode
  userProgress: ReactNode
}

export default function DashboardLayout({ main, userProgress }: DashboardLayoutProps) {
  return (
    <>
      <div className="flex-1 basis-[330px] min-w-0">{main}</div>
      <aside className="relative flex-none max-md:hidden">
        <div className="pointer-events-auto sticky top-6 z-30 flex h-[calc(100vh-3rem)] w-fit min-w-[180px] flex-col items-stretch justify-center">
          {userProgress}
        </div>
      </aside>
    </>
  )
}
