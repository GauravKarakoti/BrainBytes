'use server'

import { cookies } from 'next/headers'

export async function setUserLocale(locale: string) {
  const cookieStore = cookies()
  cookieStore.set('NEXT_LOCALE', locale, { maxAge: 31536000 }) // 1 year
}
