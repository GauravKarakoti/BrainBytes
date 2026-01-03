"use server";

import { db } from "@/db/drizzle";
import { userSubscription, subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get all subscription plans with their features
 */
export const getAllSubscriptionPlans = async () => {
  return await db.query.subscriptionPlans.findMany({
    with: {
      features: true,
    },
    orderBy: (plans, { asc }) => [asc(plans.order)],
  });
};

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanById = async (planId: string) => {
  return await db.query.subscriptionPlans.findFirst({
    where: ({ id }, { eq }) => eq(id, planId),
    with: {
      features: true,
    },
  });
};

/**
 * Get user subscription with plan details
 */
export const getUserSubscriptionWithPlan = async (userId: string) => {
  return await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
    with: {
      plan: {
        with: {
          features: true,
        },
      },
    },
  });
};

/**
 * Check if subscription is active and not expired
 */
export const isSubscriptionActive = async (userId: string): Promise<boolean> => {
  const subscription = await db.query.userSubscription.findFirst({
    where: ({ userId: uid }, { eq }) => eq(uid, userId),
  });

  return (
    !!subscription &&
    subscription.isActive &&
    subscription.currentPeriodEnd > new Date()
  );
};

/**
 * Get premium users (for admin analytics)
 */
export const getPremiumUsers = async () => {
  const premiumUsers = await db.query.userSubscription.findMany({
    where: ({ isActive, currentPeriodEnd }, { eq, gt }) =>
      eq(isActive, true) && gt(currentPeriodEnd, new Date()),
    with: {
      plan: true,
      userProgress: true,
    },
  });

  return premiumUsers;
};

/**
 * Get upcoming subscription renewals (within 7 days)
 */
export const getUpcomingRenewals = async () => {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await db.query.userSubscription.findMany({
    where: ({ isActive, currentPeriodEnd }, { eq, lte, and }) =>
      and(eq(isActive, true), lte(currentPeriodEnd, sevenDaysFromNow)),
    with: {
      plan: true,
      userProgress: true,
    },
  });
};

/**
 * Get subscription revenue stats
 */
export const getSubscriptionStats = async () => {
  const allSubscriptions = await db.query.userSubscription.findMany({
    with: {
      plan: true,
    },
  });

  const activeCount = allSubscriptions.filter(
    (s) => s.isActive && s.currentPeriodEnd > new Date()
  ).length;

  const cancelledCount = allSubscriptions.filter((s) => s.status === "cancelled").length;

  const totalRevenue = allSubscriptions
    .filter((s) => s.isActive && s.currentPeriodEnd > new Date())
    .reduce((acc, s) => acc + (s.plan?.monthlyPrice || 0), 0);

  return {
    total: allSubscriptions.length,
    active: activeCount,
    cancelled: cancelledCount,
    paused: allSubscriptions.filter((s) => s.status === "paused").length,
    totalMonthlyRevenue: totalRevenue / 100, // Convert cents to dollars
  };
};
