import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userProgress } from "./userProgress";
import { subscriptionPlans } from "./subscriptionPlans";

export const userSubscription = pgTable("user_subscription", {
  userId: text("user_id").primaryKey().notNull(),
  // Stripe fields
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  // Crypto/Blockchain fields
  paymentMethod: text("payment_method").notNull().default("stripe"), // "stripe" or "crypto"
  planId: text("plan_id").notNull().references(() => subscriptionPlans.id),
  // Common fields
  status: text("status").notNull().default("active"), // "active", "cancelled", "paused", "expired"
  isActive: boolean("is_active").notNull().default(true),
  currentPeriodStart: timestamp("current_period_start").notNull().defaultNow(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  renewalDate: timestamp("renewal_date"),
  // Crypto specific
  txnHash: text("txn_hash"), // Transaction hash for crypto payments
  walletAddress: text("wallet_address"), // Wallet that initiated crypto payment
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one }) => ({
    userProgress: one(userProgress, {
      fields: [userSubscription.userId],
      references: [userProgress.userId],
    }),
    plan: one(subscriptionPlans, {
      fields: [userSubscription.planId],
      references: [subscriptionPlans.id],
    }),
  })
);
