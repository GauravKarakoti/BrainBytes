'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Coins, CheckCircle, Infinity } from 'lucide-react'
import { createStripeUrl } from '@/actions/user-subscription'
import { createCryptoSubscription } from '@/actions/cryptoSubscription'
import { ethers } from 'ethers'

const SHOP_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS!
const SUBSCRIPTION_COST_BYTE = 20000

interface SubscriptionCardProps {
  isActive: boolean
  isCryptoSubscription: boolean
}

export function SubscriptionCard({ isActive, isCryptoSubscription }: SubscriptionCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStripeSubscription = async () => {
    setIsLoading(true)
    startTransition(() => {
      createStripeUrl()
        .then((result) => {
          if (result.data) {
            window.location.href = result.data
          }
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to create subscription')
        })
        .finally(() => {
          setIsLoading(false)
        })
    })
  }

  const handleCryptoSubscription = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask or a compatible wallet.")
      return
    }

    setIsLoading(true)
    startTransition(async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_BYTE_TOKEN_ADDRESS!,
          [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)"
          ],
          signer
        )

        const amount = ethers.parseUnits(SUBSCRIPTION_COST_BYTE.toString(), 18)
        toast.loading("Please approve the transaction in your wallet...")

        const tx = await contract.transfer(SHOP_WALLET_ADDRESS, amount)

        toast.dismiss()
        toast.loading("Processing transaction...")
        await tx.wait()

        const result = await createCryptoSubscription(tx.hash)

        if (result.success) {
          toast.success(result.message)
          router.refresh() // Refresh to show updated status
        } else {
          toast.error("Failed to activate subscription")
        }
      } catch (err: any) {
        console.error(err)
        toast.error(err.reason || err.message || "Transaction failed")
      } finally {
        toast.dismiss()
        setIsLoading(false)
      }
    })
  }

  const benefits = [
    { icon: <Infinity className="size-4" />, text: "Unlimited Hearts" },
    { icon: <CheckCircle className="size-4" />, text: "Priority Support" },
    { icon: <CheckCircle className="size-4" />, text: "Exclusive Content" },
    { icon: <CheckCircle className="size-4" />, text: "Advanced Analytics" },
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          BrainBytes Pro
          {isActive && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Unlock premium features and enhance your learning experience
        </CardDescription>
        <div className="text-center">
          <span className="text-3xl font-bold">$20</span>
          <span className="text-muted-foreground">/month</span>
          <div className="text-sm text-muted-foreground">
            or {SUBSCRIPTION_COST_BYTE.toLocaleString()} BYTE tokens
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Premium Benefits:</h4>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                {benefit.icon}
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>

        {isActive ? (
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center">
              {isCryptoSubscription ? 'Crypto Subscription' : 'Stripe Subscription'}
            </Badge>
            <p className="text-center text-sm text-muted-foreground">
              Your subscription is active and renewing automatically
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={handleStripeSubscription}
              disabled={isPending || isLoading}
              className="w-full"
              variant="default"
            >
              <CreditCard className="mr-2 size-4" />
              {isLoading ? 'Processing...' : 'Subscribe with Card'}
            </Button>
            <Button
              onClick={handleCryptoSubscription}
              disabled={isPending || isLoading}
              className="w-full"
              variant="ghost"
            >
              <Coins className="mr-2 size-4" />
              {isLoading ? 'Processing...' : 'Subscribe with BYTE'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}