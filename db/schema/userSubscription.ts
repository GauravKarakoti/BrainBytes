import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProgress } from "./userProgress";

export const userSubscription = pgTable("user_subscription", {
  userId: text("user_id").primaryKey().notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one }) => ({
    userProgress: one(userProgress, {
      fields: [userSubscription.userId],
      references: [userProgress.userId],
    }),
  })
);
