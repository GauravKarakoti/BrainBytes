import { getRequestConfig } from 'next-intl/server'
import { locales } from '@/i18n.config'

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale || 'en'
  
  // Validate that the incoming locale is valid
  if (!locales.includes(validLocale as any)) {
    return {
      locale: 'en',
      messages: (await import('@/messages/en.json')).default,
    }
  }

  try {
    return {
      locale: validLocale,
      messages: (await import(`@/messages/${validLocale}.json`)).default,
    }
  } catch {
    return {
      locale: 'en',
      messages: (await import('@/messages/en.json')).default,
    }
  }
})
