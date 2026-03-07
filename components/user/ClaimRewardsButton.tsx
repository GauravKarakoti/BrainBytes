'use client'

import { useState, useTransition } from 'react'
import { Coins, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { claimPendingTokens } from '@/actions/claimRewards'
import { Button } from '@/components/ui/button'

type ClaimRewardsButtonProps = {
  pendingTokens: number
  hasWallet: boolean
}

export function ClaimRewardsButton({ pendingTokens, hasWallet }: ClaimRewardsButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!hasWallet) {
    return (
      <div className="flex items-center gap-x-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
        <Wallet className="size-5" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Connect Wallet</span>
          <span className="text-xs opacity-70">Connect wallet to claim rewards</span>
        </div>
      </div>
    )
  }

  if (pendingTokens === 0) {
    return null
  }

  const handleClaim = async () => {
    setIsProcessing(true)
    startTransition(async () => {
      try {
        toast.loading('Claiming your rewards...', { id: 'claim-rewards' })
        
        const result = await claimPendingTokens()
        
        if (result.error) {
          let errorMessage = 'Failed to claim rewards'
          
          switch (result.error) {
            case 'no_wallet':
              errorMessage = 'Please connect your wallet first'
              break
            case 'no_pending_tokens':
              errorMessage = 'No rewards to claim'
              break
            case 'minting_failed':
              errorMessage = result.message || 'Transaction failed. Please try again.'
              break
            default:
              errorMessage = 'An error occurred. Please try again.'
          }
          
          toast.error(errorMessage, { id: 'claim-rewards' })
        } else if (result.success) {
          toast.success(
            `Successfully claimed ${result.amount} BYTE tokens! 🎉`,
            { 
              id: 'claim-rewards',
              description: `Transaction: ${result.txHash?.slice(0, 10)}...`
            }
          )
          
          // Reload the page to update the UI
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } catch (error) {
        console.error('Error claiming rewards:', error)
        toast.error('Failed to claim rewards. Please try again.', { id: 'claim-rewards' })
      } finally {
        setIsProcessing(false)
      }
    })
  }

  const isLoading = isPending || isProcessing

  return (
    <Button
      onClick={handleClaim}
      disabled={isLoading}
      className="relative flex items-center gap-x-2 overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:opacity-50"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Claiming...</span>
        </>
      ) : (
        <>
          <Coins className="size-4" />
          <span>Claim {pendingTokens} BYTE</span>
        </>
      )}
    </Button>
  )
}
