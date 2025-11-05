'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { purchaseHearts } from '@/actions/shop'
import type { ShopItem } from '@/config/shop'

type ShopItemCardProps = {
  item: ShopItem
  hearts: number
  points: number
  gems: number
}

export function ShopItemCard({ item, hearts, points, gems }: ShopItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const hasEnoughPoints = points >= item.points
  const hasEnoughGems = 'gemsRequired' in item ? gems >= (item.gemsRequired || 0) : true
  const canPurchase = hasEnoughPoints && hasEnoughGems && !isPending && !isLoading

  const handlePurchase = () => {
    setIsLoading(true)
    startTransition(() => {
      purchaseHearts(item.id)
        .then(() => {
          toast.success(`${item.title} purchased!`)
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to purchase item')
        })
        .finally(() => {
          setIsLoading(false)
        })
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border-2 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="mb-4 text-center text-6xl">{item.icon}</div>
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          {item.hearts > 0 && (
            <span className="text-rose-500">
              +{item.hearts} ❤️
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={hasEnoughPoints ? 'text-primary' : 'text-destructive'}>
            {item.points} Points
          </span>
          {'gemsRequired' in item && item.gemsRequired && (
            <>
              <span className="text-muted-foreground">or</span>
              <span className={hasEnoughGems ? 'text-secondary' : 'text-destructive'}>
                {item.gemsRequired} 💎
              </span>
            </>
          )}
        </div>
      </div>
      <Button
        onClick={handlePurchase}
        disabled={!canPurchase}
        className="mt-4 w-full"
        variant={canPurchase ? 'primary' : 'ghost'}
      >
        {isLoading || isPending ? 'Purchasing...' : canPurchase ? 'Purchase' : 'Not Enough Points'}
      </Button>
    </div>
  )
}

type ShopGridProps = {
  items: readonly ShopItem[]
  hearts: number
  points: number
  gems: number
}

export function ShopGrid({ items, hearts, points, gems }: ShopGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} hearts={hearts} points={points} gems={gems} />
      ))}
    </div>
  )
}
