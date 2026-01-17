import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme/provider'
import { Analytics } from '@/components/Analytics'
import { Toaster } from '@/components/ui/sonner'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PracticeModal } from '@/components/modals/practice-modal'
import { AppProviders } from '@/components/providers'
import { sharedMetadata } from '@/config/metadata'
import { Chatbot } from '@/components/chatbot/Chatbot'
import { ScrollToTop } from '@/components/scroll-to-top'
import { locales } from '@/i18n.config'

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

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Provide all messages to the client
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fonts} flex flex-col font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <UserProvider>
            <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
              <AppProviders>
                <ExitModal />
                <HeartsModal />
                <PracticeModal />
                {children}
                <ScrollToTop />
                <Chatbot />
                <Toaster position="top-right" richColors />
              </AppProviders>
            </ThemeProvider>
          </UserProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}