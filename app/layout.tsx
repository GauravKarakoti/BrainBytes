import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Analytics } from '@/components/Analytics'
import { Toaster } from '@/components/ui/sonner'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PracticeModal } from '@/components/modals/practice-modal'
import { AppProviders } from '@/components/providers'
import { sharedMetadata } from '@/config/metadata'
import { Chatbot } from '@/components/chatbot/Chatbot'

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
    <html lang="en" suppressHydrationWarning className={fonts}>
      <body className="flex flex-col font-sans">
        <UserProvider>
          {/* No ThemeProvider wrapper - AppProviders already has it */}
          <AppProviders>
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            {children}
            <Chatbot />
            <Toaster 
              position="top-right" 
              richColors 
              expand={true}
              closeButton
              duration={4000}
              toastOptions={{
                className: 'font-sans',
              }}
            />
          </AppProviders>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}