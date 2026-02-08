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

  // Identify user when signed in (avoid PII like raw email)
  useEffect(() => {
    // Only identify when explicitly signed in (not undefined/loading)
    if (isSignedIn === true && user) {
      identifyUser(user.id, {
        // Avoid sending PII - only send non-sensitive traits
        name: user.fullName || undefined,
        createdAt: user.createdAt?.toISOString(),
      });
    } else if (isSignedIn === false) {
      // Only reset when explicitly signed out (not during loading)
      resetAnalytics();
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
