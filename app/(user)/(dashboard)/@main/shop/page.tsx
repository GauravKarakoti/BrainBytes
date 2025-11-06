import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { ShopGrid } from '@/components/user/shop/ShopGrid'
import { getUserProgress } from '@/db/queries/userProgress'
import { SHOP_ITEMS } from '@/config/shop'

export default async function Shop() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/') 
  }

  const userProgress = await getUserProgress(userId)

  if (!userProgress) {
    redirect('/courses')
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">Exchange your points for hearts and boosts!</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Hearts</p>
          <p className="text-3xl font-bold text-rose-500">❤️ {userProgress.hearts}</p>
        </div>
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Points</p>
          <p className="text-3xl font-bold text-primary">{userProgress.points} XP</p>
        </div>
        <div className="rounded-lg border-2 bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Gems</p>
          <p className="text-3xl font-bold text-secondary">💎 {userProgress.gems}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 bg-card p-6">
        <h2 className="mb-6 text-2xl font-bold">Available Items</h2>
        <ShopGrid
          items={SHOP_ITEMS}
          hearts={userProgress.hearts}
          points={userProgress.points}
          gems={userProgress.gems}
        />
      </div>
    </div>
  )
}
