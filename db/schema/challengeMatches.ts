import { relations } from 'drizzle-orm'
import { pgTable, text, integer, serial, pgEnum, timestamp } from 'drizzle-orm/pg-core'

import { userProgress } from '@/db/schema/userProgress'
import { challenges } from '@/db/schema/challenges'

export const matchStatusEnum = pgEnum('match_status', ['pending', 'in_progress', 'completed', 'cancelled'])

export const challengeMatches = pgTable('challenge_matches', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').references(() => challenges.id, { onDelete: 'set null' }),

  playerOneId: text('player_one_id').references(() => userProgress.userId, { onDelete: 'cascade' }).notNull(),
  playerTwoId: text('player_two_id').references(() => userProgress.userId, { onDelete: 'cascade' }),

  playerOneCode: text('player_one_code'),
  playerTwoCode: text('player_two_code'),

  playerOneLanguage: text('player_one_language'),
  playerTwoLanguage: text('player_two_language'),

  status: matchStatusEnum('status').notNull().default('pending'),
  winnerId: text('winner_id').references(() => userProgress.userId, { onDelete: 'set null' }),

  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
})

export const challengeMatchesRelations = relations(challengeMatches, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeMatches.challengeId],
    references: [challenges.id],
  }),
  playerOne: one(userProgress, {
    fields: [challengeMatches.playerOneId],
    references: [userProgress.userId],
  }),
  playerTwo: one(userProgress, {
    fields: [challengeMatches.playerTwoId],
    references: [userProgress.userId],
  }),
  winner: one(userProgress, {
    fields: [challengeMatches.winnerId],
    references: [userProgress.userId],
  }),
}))

export type ChallengeMatchType = typeof challengeMatches.$inferSelect