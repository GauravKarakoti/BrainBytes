import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { clerkClient } from '@clerk/nextjs/server'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

/**
 * This script updates existing user progress entries that have hardcoded
 * userName ("User") with their actual Clerk user data (name and image).
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
        // Fetch user data from Clerk
        const clerkUser = await clerkClient().users.getUser(userProg.userId)
        
        if (!clerkUser) {
          console.log(`⚠️  Clerk user not found for userId: ${userProg.userId}`)
          errorCount++
          continue
        }

        const newUserName = clerkUser.firstName || clerkUser.username || 'User'
        const newUserImgSrc = clerkUser.imageUrl || '/logo.svg'

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
