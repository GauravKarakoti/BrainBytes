import {
  pgTable,
  serial,
  text,
  integer,
  pgEnum,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { userProgress } from '@/db/schema/userProgress'

export const questTypeEnum = pgEnum('quest_type', [
  'daily',
  'weekly',
  'progress',
  'challenge',
  'milestone',
])

export const quests = pgTable('quests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  target: integer('target').notNull(),
  rewardPoints: integer('reward_points').notNull().default(0),
  rewardGems: integer('reward_gems').notNull().default(0),
  type: questTypeEnum('type').notNull(),
})

export const userQuestProgress = pgTable('user_quest_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => userProgress.userId, { onDelete: 'cascade' })
    .notNull(),
  questId: integer('quest_id')
    .references(() => quests.id, { onDelete: 'cascade' })
    .notNull(),
  currentProgress: integer('current_progress').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  lastCompletedAt: timestamp('last_completed_at'), 
})

export const questsRelations = relations(quests, ({ many }) => ({
  userQuestProgress: many(userQuestProgress),
}))

export const redeemedTransactions = pgTable('redeemed_transactions', {
  txHash: text('tx_hash').primaryKey(),
  userId: text('user_id').notNull().references(() => userProgress.userId),
  itemId: integer('item_id').notNull(),
  redeemedAt: timestamp('redeemed_at').defaultNow(),
});

export const userQuestProgressRelations = relations(
  userQuestProgress,
  ({ one }) => ({
    quest: one(quests, {
      fields: [userQuestProgress.questId],
      references: [quests.id],
    }),
    user: one(userProgress, {
      fields: [userQuestProgress.userId],
      references: [userProgress.userId],
    }),
  }),
)

export type Quest = typeof quests.$inferSelect
export type UserQuestProgress = typeof userQuestProgress.$inferSelect