import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { resetDailyQuests, resetWeeklyQuests } from '@/actions/quest'

export async function GET(request: Request) {
  const headersList = headers()
  const authHeader = headersList.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const isMonday = new Date().getDay() === 1

  try {
    await resetDailyQuests()
    if (isMonday) {
      await resetWeeklyQuests()
    }

    return NextResponse.json({ success: true, reset: { daily: true, weekly: isMonday } })
  } catch (error) {
    console.error('[CRON_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}