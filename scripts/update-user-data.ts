import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const AUTH0_TOKEN_AUDIENCE =
  process.env.AUTH0_MANAGEMENT_AUDIENCE ?? `${process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '')}/api/v2/`

const AUTH0_TOKEN_ENDPOINT = `${process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '')}/oauth/token`

if (!process.env.AUTH0_MANAGEMENT_CLIENT_ID || !process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || !process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error('Missing Auth0 management credentials. Please set AUTH0_MANAGEMENT_CLIENT_ID, AUTH0_MANAGEMENT_CLIENT_SECRET, and AUTH0_ISSUER_BASE_URL.')
}

const FALLBACK_AVATAR = '/logo.svg'
const FALLBACK_NAME = 'User'

let cachedManagementToken: { token: string; expiresAt: number } | null = null

async function getManagementToken() {
  const now = Date.now()
  if (cachedManagementToken && cachedManagementToken.expiresAt > now + 30_000) {
    return cachedManagementToken.token
  }

  const response = await fetch(AUTH0_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: AUTH0_TOKEN_AUDIENCE,
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to obtain Auth0 management token: ${response.status} ${response.statusText}`)
  }

  const payload = (await response.json()) as { access_token: string; expires_in: number }
  cachedManagementToken = {
    token: payload.access_token,
    expiresAt: now + payload.expires_in * 1000,
  }

  return payload.access_token
}

async function getAuth0User(userId: string) {
  const token = await getManagementToken()
  const userResponse = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '')}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (userResponse.status === 404) {
    return null
  }

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch Auth0 user ${userId}: ${userResponse.status} ${userResponse.statusText}`)
  }

  return (await userResponse.json()) as {
    email?: string
    name?: string
    nickname?: string
    picture?: string
  }
}

/**
 * This script updates existing user progress entries that have placeholder
 * user names or avatars with their actual Auth0 profile data.
 */
async function updateUserData() {
  console.log('🔄 Starting user data update...')

  try {
    // Get all user progress entries
    const allUserProgress = await db.query.userProgress.findMany()
    console.log(`📊 Found ${allUserProgress.length} user progress entries`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const userProg of allUserProgress) {
      try {
        const auth0User = await getAuth0User(userProg.userId)

        if (!auth0User) {
          console.log(`⚠️  Auth0 user not found for userId: ${userProg.userId}`)
          errorCount++
          continue
        }

        const newUserName = auth0User.name || auth0User.nickname || auth0User.email || FALLBACK_NAME
        const newUserImgSrc = auth0User.picture || FALLBACK_AVATAR

        // Check if update is needed
        const needsUpdate = 
          userProg.userName !== newUserName || 
          userProg.userImgSrc !== newUserImgSrc

        if (needsUpdate) {
          console.log(`🔄 Updating user: ${userProg.userId}`)
          console.log(`   Old: ${userProg.userName} | ${userProg.userImgSrc}`)
          console.log(`   New: ${newUserName} | ${newUserImgSrc}`)

          await db
            .update(schema.userProgress)
            .set({
              userName: newUserName,
              userImgSrc: newUserImgSrc,
            })
            .where(eq(schema.userProgress.userId, userProg.userId))

          updatedCount++
        } else {
          console.log(`✓ User ${userProg.userId} already has correct data`)
          skippedCount++
        }
      } catch (error) {
        console.error(`❌ Error updating user ${userProg.userId}:`, error)
        errorCount++
      }
    }

    console.log('\n✅ Update complete!')
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Skipped: ${skippedCount}`)
    console.log(`   Errors: ${errorCount}`)
  } catch (error) {
    console.error('❌ Fatal error during update:', error)
    process.exit(1)
  }
}

updateUserData()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
