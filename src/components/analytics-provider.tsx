"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trackPageView, identifyUser, resetAnalytics } from "@/lib/analytics";

/**
 * Analytics Provider Component
 *
 * Automatically tracks page views and identifies users.
 * Add this to your root layout to enable analytics throughout the app.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_ANALYTICS_PROVIDER: "posthog" | "mixpanel" | "ga"
 * - NEXT_PUBLIC_ANALYTICS_KEY: Your analytics API key
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();

  // Track page views
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || undefined,
        createdAt: user.createdAt?.toISOString(),
      });
    } else if (!isSignedIn) {
      resetAnalytics();
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
