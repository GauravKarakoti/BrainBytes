import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { resetDailyQuests, resetWeeklyQuests } from '@/actions/quest'

function getISTDay(): number {
  const now = new Date()
  console.log('IST Day:', getISTDay())

  // Convert current time to IST (UTC + 5:30)
  const istOffsetInMs = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffsetInMs)

  return istTime.getUTCDay()
}

export async function GET(request: Request) {
  const headersList = headers()
  const authHeader = headersList.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const isMonday = getISTDay() === 1

  try {
    await resetDailyQuests()

    if (isMonday) {
      await resetWeeklyQuests()
    }

    return NextResponse.json({
      success: true,
      reset: {
        daily: true,
        weekly: isMonday,
      },
    })
  } catch (error) {
    console.error('[CRON_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
