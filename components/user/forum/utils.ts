export type ForumViewer = {
  id: string
  name: string
  avatar: string
  isAdmin: boolean
}

type RelativeUnit = [Intl.RelativeTimeFormatUnit, number]

const RELATIVE_TIME_FORMAT = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

const RELATIVE_TIME_DIVISORS: RelativeUnit[] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function formatRelativeTime(dateValue: string | Date) {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  const nowSeconds = Date.now() / 1000
  const diffSeconds = Math.round((date.getTime() / 1000) - nowSeconds)

  for (const [unit, divisor] of RELATIVE_TIME_DIVISORS) {
    const delta = diffSeconds / divisor
    if (Math.abs(delta) >= 1 || unit === 'minute') {
      return RELATIVE_TIME_FORMAT.format(Math.round(delta), unit)
    }
  }

  return 'just now'
}

export function ensureDate(value: string | Date) {
  return typeof value === 'string' ? new Date(value) : value
}
