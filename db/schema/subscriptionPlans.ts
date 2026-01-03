import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userSubscription } from "./userSubscription";

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Free", "Pro", "Premium", "Elite"
  description: text("description").notNull(),
  monthlyPrice: integer("monthly_price").notNull(), // in cents
  yearlyPrice: integer("yearly_price").notNull(), // in cents
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  order: integer("order").notNull().default(0),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionFeatures = pgTable("subscription_features", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => subscriptionPlans.id, {
    onDelete: "cascade",
  }),
  featureName: text("feature_name").notNull(),
  featureDescription: text("feature_description"),
  value: integer("value").notNull().default(0), // For numeric limits (e.g., 100 for hearts per month)
  isUnlimited: boolean("is_unlimited").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionFeaturesRelations = relations(subscriptionFeatures, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [subscriptionFeatures.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  features: many(subscriptionFeatures),
  userSubscriptions: many(userSubscription),
}));

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type SubscriptionFeature = typeof subscriptionFeatures.$inferSelect;
