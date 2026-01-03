import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please define it before starting the application.')
}

const sql = neon(databaseUrl)
export const db = drizzle(sql, { schema, logger: true })


export const getDb = () => {
  return db
}
