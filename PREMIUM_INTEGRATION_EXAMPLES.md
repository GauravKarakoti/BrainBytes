# 💡 Premium Features - Integration Examples

This document provides real-world code examples for integrating premium features into your BrainBytes application.

---

## Example 1: Unlimited Hearts Feature

### Before (Free Users Only)
```tsx
// components/user/Hearts.tsx
export function Hearts() {
  const [hearts, setHearts] = useState(5); // Fixed to 5 per day

  return (
    <div className="flex items-center gap-2">
      <Heart className="text-red-500" />
      <span>{hearts} remaining today</span>
    </div>
  );
}
```

### After (With Premium)
```tsx
// components/user/Hearts.tsx
import { getFeatureLimit } from "@/lib/premium";
import { useUser } from "@clerk/nextjs"; // or your auth provider

export async function Hearts() {
  const { user } = useUser();
  const dailyLimit = await getFeatureLimit(user.id, "Hearts");
  
  // dailyLimit = 5 for free users, 0 (unlimited) for premium
  const hearts = await getUserDailyHearts(user.id);
  const isUnlimited = dailyLimit === 0;

  return (
    <div className="flex items-center gap-2">
      <Heart className={isUnlimited ? "text-purple-500" : "text-red-500"} />
      <span>
        {isUnlimited 
          ? "Unlimited hearts" 
          : `${hearts}/${dailyLimit} remaining today`}
      </span>
      {isUnlimited && <Crown className="text-purple-500 w-4 h-4" />}
    </div>
  );
}
```

---

## Example 2: Feature Lock - Live Mentoring

### Create a Mentoring Page
```tsx
// app/(user)/mentoring/page.tsx
import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";
import { MentoringInterface } from "@/components/mentoring/MentoringInterface";
import { UpgradeCTA } from "@/components/common/UpgradeCTA";

export default function MentoringPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold mb-4">Live Mentoring Sessions</h1>
      <p className="text-muted-foreground mb-8">
        Get personalized guidance from experienced mentors
      </p>

      <PremiumFeatureLock 
        feature="Live Mentoring"
        fallback={<UpgradeCTA feature="Live Mentoring Sessions" />}
      >
        <MentoringInterface />
      </PremiumFeatureLock>
    </div>
  );
}
```

### Mentoring Interface Component
```tsx
// components/mentoring/MentoringInterface.tsx
"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  availableSlots: Date[];
}

export function MentoringInterface() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch available mentors
    fetchMentors();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mentors.map(mentor => (
        <MentorCard 
          key={mentor.id}
          mentor={mentor}
          onBookSlot={(slot) => bookSession(mentor.id, slot)}
        />
      ))}
    </div>
  );
}
```

---

## Example 3: Conditional Course Access

### Access Control in Course Page
```tsx
// app/(user)/courses/[courseId]/page.tsx
import { hasFeature } from "@/lib/premium";
import { requireUser } from "@/lib/auth0";

interface CoursePageProps {
  params: { courseId: string };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const user = await requireUser();
  const course = await getCourse(params.courseId);

  // Check if course requires premium
  if (course.isPremiumOnly) {
    const hasPremium = await hasFeature(user.id, "Premium Access");
    
    if (!hasPremium) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Premium Course</h2>
          <p className="text-muted-foreground mb-6">
            This course is available to premium members only
          </p>
          <Link 
            href="/premium"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold"
          >
            Upgrade to Premium
          </Link>
        </div>
      );
    }
  }

  return <CourseContent course={course} />;
}
```

---

## Example 4: Advanced Analytics Dashboard

### Server-Side Analytics Fetching
```tsx
// app/(user)/dashboard/analytics/page.tsx
import { hasFeature } from "@/lib/premium";
import { requireUser } from "@/lib/auth0";

export default async function AnalyticsPage() {
  const user = await requireUser();
  
  // Check for premium analytics feature
  const hasAdvancedAnalytics = await hasFeature(user.id, "Advanced Analytics");

  // Always show basic analytics
  const basicStats = await getBasicAnalytics(user.id);

  // Show advanced analytics only for premium users
  const advancedStats = hasAdvancedAnalytics 
    ? await getAdvancedAnalytics(user.id)
    : null;

  return (
    <div className="space-y-6">
      <BasicAnalyticsDashboard stats={basicStats} />
      
      {hasAdvancedAnalytics && advancedStats && (
        <>
          <AdvancedMetricsCard stats={advancedStats} />
          <PredictiveInsights userId={user.id} />
          <PerformanceComparison userId={user.id} />
        </>
      )}

      {!hasAdvancedAnalytics && (
        <PremiumUpgradeCard 
          feature="Advanced Analytics"
          description="Unlock detailed insights, performance predictions, and more"
        />
      )}
    </div>
  );
}
```

### Analytics Component
```tsx
// components/dashboard/AdvancedMetricsCard.tsx
import { TrendingUp, BarChart3, Target } from "lucide-react";

interface AdvancedStats {
  weeklyTrend: number[];
  strengthAreas: string[];
  improvementAreas: string[];
  estimatedMasteryDate: Date;
}

export function AdvancedMetricsCard({ stats }: { stats: AdvancedStats }) {
  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-500" />
        <h3 className="text-lg font-semibold">Advanced Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox 
          icon={<Target />}
          label="Strength Areas"
          items={stats.strengthAreas}
        />
        <StatBox 
          icon={<BarChart3 />}
          label="Improvement Areas"
          items={stats.improvementAreas}
        />
        <StatBox 
          label="Estimated Mastery"
          value={stats.estimatedMasteryDate.toLocaleDateString()}
        />
      </div>
    </div>
  );
}
```

---

## Example 5: Tiered Challenge Rewards

### Reward Multiplier for Premium Users
```tsx
// lib/rewards.ts
import { getFeatureLimit } from "@/lib/premium";

export async function calculateChallengeRewards(
  userId: string,
  baseRewards: {
    xp: number;
    gems: number;
    byteTokens: number;
  }
) {
  const subscription = await getUserSubscription(userId);

  // Determine multiplier based on plan
  let multiplier = 1;
  let bonusDescription = "";

  switch (subscription?.plan?.name) {
    case "pro":
      multiplier = 1.1; // 10% bonus
      bonusDescription = "Pro Bonus: +10%";
      break;
    case "premium":
      multiplier = 1.25; // 25% bonus
      bonusDescription = "Premium Bonus: +25%";
      break;
    case "elite":
      multiplier = 1.5; // 50% bonus
      bonusDescription = "Elite Bonus: +50%";
      break;
  }

  return {
    xp: Math.floor(baseRewards.xp * multiplier),
    gems: Math.floor(baseRewards.gems * multiplier),
    byteTokens: Math.floor(baseRewards.byteTokens * multiplier),
    bonusDescription,
  };
}
```

### Using Reward Multiplier
```tsx
// actions/submitChallenge.ts
"use server";

import { calculateChallengeRewards } from "@/lib/rewards";
import { awardUserRewards } from "@/db/queries/rewards";

export async function submitChallenge(userId: string, challengeId: string) {
  // Validate submission...
  const isCorrect = await validateSubmission(userId, challengeId);

  if (isCorrect) {
    const baseRewards = {
      xp: 100,
      gems: 10,
      byteTokens: 5,
    };

    // Calculate rewards with premium multiplier
    const actualRewards = await calculateChallengeRewards(userId, baseRewards);

    // Award to user
    await awardUserRewards(userId, actualRewards);

    return {
      success: true,
      rewards: actualRewards,
      message: `Challenge completed! ${actualRewards.bonusDescription}`,
    };
  }

  return { success: false, message: "Incorrect solution" };
}
```

---

## Example 6: Code Review Feature

### Show Code Review Interface
```tsx
// components/codeReview/CodeReviewRequest.tsx
"use client";

import { PremiumFeatureLock } from "@/components/subscription/PremiumFeatureLock";
import { Code2, Send } from "lucide-react";
import { useState } from "react";

export function CodeReviewRequest() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);

  const submitForReview = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/code-review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const result = await response.json();
      // Handle review submission...
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumFeatureLock feature="Code Reviews">
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code2 className="text-primary" />
          Request Code Review
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-sm"
              placeholder="Paste your code here..."
            />
          </div>

          <button
            onClick={submitForReview}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </PremiumFeatureLock>
  );
}
```

---

## Example 7: VIP Event Access

### Event Gate Component
```tsx
// components/events/EventCard.tsx
import { Calendar, Lock, Users } from "lucide-react";
import { hasFeature } from "@/lib/premium";

interface Event {
  id: string;
  title: string;
  date: Date;
  attendees: number;
  vipOnly?: boolean;
}

export async function EventCard({ event, userId }: { event: Event; userId: string }) {
  let isAccessible = true;
  let accessMessage = "";

  if (event.vipOnly) {
    const hasVipAccess = await hasFeature(userId, "VIP Events");
    isAccessible = hasVipAccess;
    accessMessage = hasVipAccess ? "VIP Event" : "Elite Only";
  }

  return (
    <div className={`p-4 border rounded-lg ${isAccessible ? "bg-card" : "bg-muted opacity-75"}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {event.date.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event.attendees} attending
            </span>
          </div>
        </div>

        {!isAccessible && (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="mt-4">
        {isAccessible ? (
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90">
            Register Now
          </button>
        ) : (
          <button className="w-full bg-muted text-muted-foreground py-2 rounded-lg font-semibold cursor-not-allowed">
            {accessMessage} - Upgrade to Elite
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Example 8: API Route Protection

### Protect API Endpoints
```typescript
// app/api/premium-feature/route.ts
import { requireUser } from "@/lib/auth0";
import { hasFeature } from "@/lib/premium";

export async function POST(request: Request) {
  const user = await requireUser();

  // Check if user has required feature
  const canAccess = await hasFeature(user.id, "Premium Analytics");

  if (!canAccess) {
    return new Response(
      JSON.stringify({ 
        error: "This feature requires a premium subscription",
        code: "PREMIUM_REQUIRED"
      }),
      { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Process premium request...
  const data = await request.json();
  const result = await processPremiumRequest(user.id, data);

  return new Response(
    JSON.stringify(result),
    { headers: { "Content-Type": "application/json" } }
  );
}
```

---

## Summary of Key Utilities

```typescript
// Check if user is premium
import { isPremiumUser } from "@/lib/premium";
const isPremium = await isPremiumUser(userId);

// Check specific feature
import { hasFeature } from "@/lib/premium";
const hasReview = await hasFeature(userId, "Code Reviews");

// Get feature limit
import { getFeatureLimit } from "@/lib/premium";
const limit = await getFeatureLimit(userId, "Hearts"); // 0 = unlimited

// Get days remaining
import { getDaysRemaining } from "@/lib/premium";
const daysLeft = await getDaysRemaining(userId);

// Get user subscription
import { getUserSubscription } from "@/db/queries/userProgress";
const sub = await getUserSubscription(userId);
```

---

These examples demonstrate how to integrate premium features throughout your BrainBytes application. Mix and match patterns to suit your needs!
