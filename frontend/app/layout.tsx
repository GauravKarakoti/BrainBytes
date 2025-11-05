import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme/provider'
import { Analytics } from '@/components/Analytics'
import { Toaster } from '@/components/ui/sonner'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PracticeModal } from '@/components/modals/practice-modal'

import { sharedMetadata } from '@/config/metadata'

import { fonts } from '@/styles/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: {
    template: '%s | BrainBytes',
    default: 'BrainBytes - Master Data Structures & Algorithms',
  },
  description:
    'Master Data Structures and Algorithms with BrainBytes - Learn through interactive coding challenges in Python, JavaScript, C++, Java, and more!',
  keywords: ['DSA', 'Data Structures', 'Algorithms', 'Coding', 'Programming', 'LeetCode', 'Interview Prep'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          fontSize: '0.875rem',
          borderRadius: '0.5rem',
          colorPrimary: 'hsl(142, 71%, 45%)',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${fonts} flex flex-col font-sans`}>
          <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
