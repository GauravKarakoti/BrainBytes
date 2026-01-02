import { db } from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if user has active premium subscription
 */
export const isPremiumUser = async (userId: string): Promise<boolean> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
  });

  if (!subscription) return false;

  return (
    subscription.isActive &&
    subscription.currentPeriodEnd > new Date()
  );
};

/**
 * Check if user has specific premium feature
 */
export const hasFeature = async (
  userId: string,
  featureName: string
): Promise<boolean> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
    with: {
      plan: {
        with: {
          features: true,
        },
      },
    },
  });

  if (!subscription || !subscription.isActive) return false;
  if (subscription.currentPeriodEnd < new Date()) return false;

  return subscription.plan?.features.some(
    (f) => f.featureName === featureName
  ) ?? false;
};

/**
 * Get feature limit for user (0 or unlimited = no limit)
 */
export const getFeatureLimit = async (
  userId: string,
  featureName: string
): Promise<number | null> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
    with: {
      plan: {
        with: {
          features: true,
        },
      },
    },
  });

  if (!subscription || !subscription.isActive) return null;
  if (subscription.currentPeriodEnd < new Date()) return null;

  const feature = subscription.plan?.features.find(
    (f) => f.featureName === featureName
  );

  if (!feature) return null;
  if (feature.isUnlimited) return -1; // -1 indicates unlimited
  return feature.value;
};

/**
 * Check if user's subscription is about to expire (within 7 days)
 */
export const isSubscriptionExpiringSoon = async (userId: string): Promise<boolean> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
  });

  if (!subscription) return false;

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return subscription.currentPeriodEnd <= sevenDaysFromNow;
};

/**
 * Get days remaining in subscription
 */
export const getDaysRemaining = async (userId: string): Promise<number | null> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
  });

  if (!subscription) return null;

  const now = new Date();
  const endDate = subscription.currentPeriodEnd;

  if (endDate < now) return 0;

  const daysRemaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysRemaining;
};

/**
 * Format subscription status for display
 */
export const formatSubscriptionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: "🟢 Active",
    cancelled: "🔴 Cancelled",
    paused: "⏸️ Paused",
    expired: "⏱️ Expired",
    pending: "⏳ Pending",
  };

  return statusMap[status] || status;
};
