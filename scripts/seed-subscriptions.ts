import { db } from "@/db/drizzle";
import { subscriptionPlans, subscriptionFeatures } from "@/db/schema";

export const seedSubscriptionPlans = async () => {
  // Clear existing plans
  await db.delete(subscriptionPlans);

  // Seed subscription plans
  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      order: 0,
      isPopular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "For serious learners",
      monthlyPrice: 999, // $9.99
      yearlyPrice: 9999, // $99.99
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
      order: 1,
      isPopular: true,
    },
    {
      id: "premium",
      name: "Premium",
      description: "All features included",
      monthlyPrice: 1999, // $19.99
      yearlyPrice: 19999, // $199.99
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
      order: 2,
      isPopular: false,
    },
    {
      id: "elite",
      name: "Elite",
      description: "VIP treatment & priority support",
      monthlyPrice: 4999, // $49.99
      yearlyPrice: 49999, // $499.99
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_ELITE_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_ELITE_YEARLY,
      order: 3,
      isPopular: false,
    },
  ];

  await db.insert(subscriptionPlans).values(plans);

  // Seed subscription features
  const features = [
    // Free plan features
    { planId: "free", featureName: "Courses", featureDescription: "Basic courses", value: 0, isUnlimited: false },
    { planId: "free", featureName: "Hearts", featureDescription: "Daily hearts for practice", value: 5, isUnlimited: false },
    { planId: "free", featureName: "Challenge Matches", featureDescription: "PvP coding challenges", value: 3, isUnlimited: false },
    { planId: "free", featureName: "Forum Access", featureDescription: "Community forum", value: 0, isUnlimited: false },

    // Pro plan features
    { planId: "pro", featureName: "Courses", featureDescription: "All courses unlocked", value: 0, isUnlimited: true },
    { planId: "pro", featureName: "Hearts", featureDescription: "Unlimited hearts per day", value: 0, isUnlimited: true },
    { planId: "pro", featureName: "Challenge Matches", featureDescription: "Unlimited PvP challenges", value: 0, isUnlimited: true },
    { planId: "pro", featureName: "Forum Access", featureDescription: "Premium forum access", value: 0, isUnlimited: true },
    { planId: "pro", featureName: "Ad-Free Experience", featureDescription: "No advertisements", value: 0, isUnlimited: true },
    { planId: "pro", featureName: "Progress Analytics", featureDescription: "Detailed performance analytics", value: 0, isUnlimited: true },

    // Premium plan features (all Pro features + more)
    { planId: "premium", featureName: "Courses", featureDescription: "All courses + advanced topics", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Hearts", featureDescription: "Unlimited hearts", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Challenge Matches", featureDescription: "Unlimited challenges with prizes", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Forum Access", featureDescription: "Priority forum support", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Ad-Free Experience", featureDescription: "No advertisements", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Progress Analytics", featureDescription: "Advanced AI-powered analytics", value: 0, isUnlimited: true },
    { planId: "premium", featureName: "Live Mentoring", featureDescription: "1 session per month", value: 1, isUnlimited: false },
    { planId: "premium", featureName: "Code Review", featureDescription: "Monthly code reviews", value: 4, isUnlimited: false },
    { planId: "premium", featureName: "Custom Learning Path", featureDescription: "Personalized curriculum", value: 0, isUnlimited: true },

    // Elite plan features (all Premium + VIP)
    { planId: "elite", featureName: "Courses", featureDescription: "All courses + exclusive content", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Hearts", featureDescription: "Unlimited hearts", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Challenge Matches", featureDescription: "Unlimited with special tournaments", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Forum Access", featureDescription: "Direct mentor access", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Ad-Free Experience", featureDescription: "No advertisements", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Progress Analytics", featureDescription: "Premium AI analytics + predictions", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Live Mentoring", featureDescription: "Unlimited sessions", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Code Review", featureDescription: "Unlimited reviews", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Custom Learning Path", featureDescription: "100% personalized curriculum", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Priority Support", featureDescription: "24/7 dedicated support", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Exclusive Events", featureDescription: "VIP coding competitions", value: 0, isUnlimited: true },
    { planId: "elite", featureName: "Crypto Rewards", featureDescription: "Extra BYTE token rewards", value: 0, isUnlimited: true },
  ];

  for (const feature of features) {
    await db.insert(subscriptionFeatures).values({
      id: `${feature.planId}-${feature.featureName.toLowerCase().replace(/\s+/g, "-")}`,
      planId: feature.planId,
      featureName: feature.featureName,
      featureDescription: feature.featureDescription,
      value: feature.value,
      isUnlimited: feature.isUnlimited,
    });
  }

  console.log("✅ Subscription plans and features seeded successfully!");
};
