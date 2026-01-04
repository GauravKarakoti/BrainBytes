'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { purchaseWithCurrency } from '@/actions/shop'
import { verifyRedemption } from '@/actions/redeemVoucher'
import type { ShopItem } from '@/config/shop'
import { createWalletClient, createPublicClient, custom, parseUnits, type Address } from 'viem'

const byteTokenAbi = [
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
];

const BYTE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS as Address;
const SHOP_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS as Address;
const B_DECIMALS = 18;

type ShopItemCardProps = {
  item: ShopItem
  hearts: number
  points: number
  gems: number
  bytes: number
}

export function ShopItemCard({ item, hearts, points, gems, bytes }: ShopItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false) 

  const hasEnoughPoints = item.points ? points >= item.points : true;
  const hasEnoughGems = 'gemsRequired' in item ? gems >= (item.gemsRequired || 0) : true;
  
  const isCryptoPurchase = !!item.byteCost && item.byteCost > 0;
  const isGemPurchase = 'gemsRequired' in item && item.gemsRequired && item.gemsRequired > 0;
  const isPointPurchase = item.points > 0 && !isCryptoPurchase && !isGemPurchase;

  const hasEnoughBytes = item.byteCost ? Number(bytes) >= item.byteCost : true;
  
  const canPurchase = !isPending && (
    (isCryptoPurchase && hasEnoughBytes) ||
    (isGemPurchase && hasEnoughGems) ||
    (isPointPurchase && hasEnoughPoints)
  );
  
  const handlePurchase = async () => {
    if (isGemPurchase || isPointPurchase) {
      setIsLoading(true)
      startTransition(() => {
        purchaseWithCurrency(item.id)
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
    else if (isCryptoPurchase) {
      if (!window.ethereum) {
        toast.error("Please install MetaMask or a compatible wallet.");
        return;
      }
      
      setIsLoading(true);
      startTransition(async () => {
        try {
          if (!window.ethereum) throw new Error('No wallet provider')

          const transport = custom(window.ethereum as any)
          const walletClient = createWalletClient({ transport })
          const publicClient = createPublicClient({ transport })

          const amount = parseUnits(item.byteCost!.toString(), B_DECIMALS)
          toast.loading('Please approve the transaction in your wallet...')

          const tx = await walletClient.writeContract({
            address: BYTE_TOKEN_ADDRESS,
            abi: byteTokenAbi as any,
            functionName: 'transfer',
            args: [SHOP_WALLET_ADDRESS, amount],
          })

          // `writeContract` can return an object containing a `hash` or the hash directly
          const txHash: string =
            typeof (tx as any)?.hash === 'string'
              ? (tx as any).hash
              : String((tx as any) ?? '')

          toast.loading('Processing transaction...')

          // Wait for receipt
          await publicClient.waitForTransactionReceipt({ hash: txHash })

          const result = await verifyRedemption(item.id, txHash)

          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success(`${item.title} redeemed successfully!`)
          }
        } catch (err: any) {
          console.error(err)
          toast.error(err.reason || err.message || 'Transaction failed')
        } finally {
          setIsLoading(false)
        }
      });
    }
  }

  let buttonText = "Purchase";
  let costText = "";
  if (isCryptoPurchase) {
    costText = `${item.byteCost} BYTE`;
    buttonText = `Redeem for ${costText}`;
    if (!hasEnoughBytes) buttonText = "Not enough bytes";
  } else if (isGemPurchase) {
    costText = `${item.gemsRequired} 💎`;
    buttonText = `Purchase for ${costText}`;
    if (!hasEnoughGems) buttonText = "Not enough gems";
  } else if (isPointPurchase) {
     costText = `${item.points} Points`;
     buttonText = `Purchase for ${costText}`;
     if (!hasEnoughPoints) buttonText = "Not enough points";
  }

  const renderCostDisplay = () => {
    const costs = [];
    if (item.points > 0) {
      costs.push(
        <span key="points" className={hasEnoughPoints ? 'text-primary' : 'text-destructive'}>
          {item.points} Points
        </span>
      );
    }
    if ('gemsRequired' in item && item.gemsRequired && item.gemsRequired > 0) {
      if (costs.length > 0) costs.push(<span key="gem-or" className="text-muted-foreground">or</span>);
      costs.push(
        <span key="gems" className={hasEnoughGems ? 'text-secondary' : 'text-destructive'}>
          {item.gemsRequired} 💎
        </span>
      );
    }
    if (item.byteCost && item.byteCost > 0) {
       if (costs.length > 0) costs.push(<span key="byte-or" className="text-muted-foreground">or</span>);
       costs.push(
         <span key="bytes" className={hasEnoughBytes ? 'text-yellow-500' : 'text-destructive'}>
           {item.byteCost} BYTE
         </span>
       );
    }
    return costs;
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
          {'rewardPoints' in item && item.rewardPoints && item.rewardPoints > 0 && (
             <span className="text-primary">
              +{item.rewardPoints} XP
            </span>
          )}
        </div>
        <div className="flex min-h-[20px] items-center justify-center gap-2 text-sm">
          {renderCostDisplay()}
        </div>
      </div>
      <Button
        onClick={handlePurchase}
        disabled={!canPurchase || isLoading}
        className="mt-4 w-full"
        variant={canPurchase ? 'primary' : 'ghost'}
      >
        {isLoading || isPending ? 'Processing...' : buttonText}
      </Button>
    </div>
  )
}

type ShopGridProps = {
  items: readonly ShopItem[]
  hearts: number
  points: number
  gems: number
  bytes: number
}

export function ShopGrid({ items, hearts, points, gems, bytes }: ShopGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} hearts={hearts} points={points} gems={gems} bytes={bytes} />
      ))}
    </div>
  )
}