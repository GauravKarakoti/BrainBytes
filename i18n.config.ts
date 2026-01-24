export const locales = ['en', 'es']
export const defaultLocale = 'en'

// Simple i18n configuration without server integration
export const getLocaleFromCookie = () => {
  if (typeof window === 'undefined') return defaultLocale
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
  return cookie?.split('=')[1] || defaultLocale
}
