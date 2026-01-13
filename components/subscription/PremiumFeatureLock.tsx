"use client";

import { useEffect, useState } from "react";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface PremiumFeatureLockProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to lock features behind premium subscription
 */
export const PremiumFeatureLock = ({
  feature,
  children,
  fallback,
}: PremiumFeatureLockProps) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const response = await fetch("/api/subscriptions/check-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature }),
        });

        const data = await response.json();
        setIsPremium(data.isPremium && data.hasFeature);
      } catch (error) {
        console.error("Failed to check premium status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPremium();
  }, [feature]);

  if (loading) {
    return <div className="opacity-50">{children}</div>;
  }

  if (!isPremium) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Lock className="text-primary mb-2" size={24} />
          <p className="text-sm font-semibold mb-2">Premium Feature</p>
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Upgrade to unlock this feature
          </p>
          <Link
            href="/premium"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90"
          >
            <Crown size={16} />
            Upgrade Now
          </Link>
        </div>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    );
  }

  return <>{children}</>;
};
