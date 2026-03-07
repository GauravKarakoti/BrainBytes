// app/components/user/Providers.tsx - CORRECTED VERSION
'use client'

import { type ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme/provider'
// REMOVE: import { Toaster } from '@/components/ui/sonner' // ← Remove this

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* REMOVE: <Toaster /> - Already in root layout */}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}