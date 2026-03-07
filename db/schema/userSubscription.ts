import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { userProgress } from "./userProgress";

export const userSubscription = pgTable("user_subscription", {
  userId: text("user_id").primaryKey().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  // Crypto subscription fields
  cryptoSubscriptionId: text("crypto_subscription_id"),
  cryptoPaymentTxHash: text("crypto_payment_tx_hash").unique(),
  cryptoCurrentPeriodEnd: timestamp("crypto_current_period_end"),
  isCryptoSubscription: boolean("is_crypto_subscription").default(false),
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
