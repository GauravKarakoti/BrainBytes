import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL || "postgres://mock:mock@localhost:5432/mock")

export const db = drizzle(sql, { schema, logger: true })


export const getDb = () => {
  return db
}
