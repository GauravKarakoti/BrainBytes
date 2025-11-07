'use client'

import { useEffect, useTransition } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { sepolia } from 'wagmi/chains'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { saveWalletAddress } from '@/actions/saveWallet'

const SEPOLIA_CHAIN_ID = sepolia.id

export const ConnectWalletButton = () => {
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (isConnected && address) {
      if (chainId === SEPOLIA_CHAIN_ID) {
        startTransition(async () => {
          const result = await saveWalletAddress(address)
          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success('Wallet linked successfully!')
          }
        })
      } else if (!isPending) {
        toast.error('Wrong network. Please switch to Sepolia to link your wallet.')
      }
    }
  }, [address, isConnected, chainId, isPending, startTransition])

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (isConnected && address) {
    if (chainId !== SEPOLIA_CHAIN_ID) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-sm text-destructive">
            Wrong Network
          </span>
          <Button
            variant="super"
            size="sm"
            onClick={() => switchChain && switchChain({ chainId: SEPOLIA_CHAIN_ID })}
            disabled={isPending}
          >
            Switch to Sepolia
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnect()}
            disabled={isPending}
          >
            Disconnect
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-muted-foreground">
          {truncateAddress(address)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          disabled={isPending}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="primary"
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting || isPending}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}

export const WalletManager = ({
  savedWalletAddress,
}: {
  savedWalletAddress: string | null
}) => {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  if (isConnected && address) {
    if (chainId !== SEPOLIA_CHAIN_ID) {
      return (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-destructive bg-card p-4">
          <p className="text-sm font-bold text-destructive">Wrong Network</p>
          <span className="font-mono text-sm text-primary">
            {truncateAddress(address)}
          </span>
          <p className="text-center text-xs text-destructive">
            Please switch to the Sepolia network to earn rewards.
          </p>
          <Button
            variant="super"
            size="sm"
            onClick={() => switchChain && switchChain({ chainId: SEPOLIA_CHAIN_ID })}
          >
            Switch to Sepolia
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 bg-card p-4">
        <p className="text-sm font-bold text-green-500">Wallet Connected</p>
        <span className="font-mono text-sm text-primary">
          {truncateAddress(address)}
        </span>
        {savedWalletAddress &&
          savedWalletAddress.toLowerCase() !== address.toLowerCase() && (
            <p className="text-center text-xs text-destructive">
              Warning: This is not the wallet you have saved for rewards.
            </p>
          )}
      </div>
    )
  }

  if (savedWalletAddress) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border-2 bg-card p-4">
        <p className="text-sm text-muted-foreground">Linked Wallet</p>
        <span className="font-mono text-sm font-semibold">
          {truncateAddress(savedWalletAddress)}
        </span>
        <ConnectWalletButton />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border-2 bg-card p-4">
      <p className="text-center text-sm text-muted-foreground">
        Connect your wallet to earn and redeem BYTE tokens.
      </p>
      <ConnectWalletButton />
    </div>
  )
}