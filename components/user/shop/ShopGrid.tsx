'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { purchaseHearts } from '@/actions/shop'
import { verifyRedemption } from '@/actions/redeemVoucher'
import type { ShopItem } from '@/config/shop'
import { ethers } from 'ethers'

const byteTokenAbi = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const BYTE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS!;
const SHOP_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS!;
const B_DECIMALS = 18;

type ShopItemCardProps = {
  item: ShopItem
  hearts: number
  points: number
  gems: number
  bytes: number
}

export async function ShopItemCard({ item, hearts, points, gems, bytes }: ShopItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const hasEnoughPoints = item.points ? points >= item.points : true;
  const hasEnoughGems = 'gemsRequired' in item ? gems >= (item.gemsRequired || 0) : true;
  
  const isCryptoPurchase = !!item.byteCost && item.byteCost > 0;
  const isGemPurchase = 'gemsRequired' in item && item.gemsRequired && item.gemsRequired > 0;

  const hasEnoughBytes = item.byteCost ? Number(bytes) >= item.byteCost : true;
  const canPurchase = ((isCryptoPurchase && hasEnoughBytes) || (isGemPurchase && hasEnoughGems)) && !isPending;
  console.log("Item:",item);
  console.log("Bytes:",Number(bytes));
  console.log("Byte Balance:", hasEnoughBytes)

  const handlePurchase = async () => {
    if (isGemPurchase) {
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

    if (isCryptoPurchase) {
      if (!window.ethereum) {
        toast.error("Please install MetaMask or a compatible wallet.");
        return;
      }
      
      startTransition(async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(BYTE_TOKEN_ADDRESS, byteTokenAbi, signer);
          
          const amount = ethers.parseUnits(item.byteCost!.toString(), B_DECIMALS);
          console.log("Amount:",amount);
          toast.loading("Please approve the transaction in your wallet...");
          const tx = await contract.transfer(SHOP_WALLET_ADDRESS, amount);
          
          toast.loading("Processing transaction...");
          await tx.wait(); 
          console.log("TX:",tx);

          const result = await verifyRedemption(item.id, tx.hash);

          if (result.error) {
            toast.error(result.error);
          } else {
            toast.success(`${item.title} redeemed successfully!`);
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err.reason || err.message || "Transaction failed");
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
  } else if (item.points > 0) {
     costText = `${item.points} Points`;
     buttonText = `Purchase for ${costText}`;
     if (!hasEnoughPoints) buttonText = "Not enough points";
  }
  console.log("Button Text:",buttonText);

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
      <div className="text-center text-lg font-semibold text-primary">
        {costText}
      </div>
      <Button
        onClick={handlePurchase}
        disabled={!canPurchase}
        className="mt-4 w-full"
        variant={canPurchase ? 'primary' : 'ghost'}
      >
        {isLoading || isPending ? 'Purchasing...' : buttonText}
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
  console.log("Item sent:",items);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} hearts={hearts} points={points} gems={gems} bytes={bytes} />
      ))}
    </div>
  )
}
