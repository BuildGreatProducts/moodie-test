"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { trackPageView, identifyUser, resetAnalytics } from "@/lib/analytics";

/**
 * PageViewTracker Component
 *
 * Tracks page views using useSearchParams which requires Suspense.
 * This is extracted to avoid forcing the parent to be CSR.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * UserIdentifier Component
 *
 * Identifies the user for analytics when signed in.
 * Uses useAuth instead of useUser to avoid fetching full user data.
 */
function UserIdentifier() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or before hydration
  if (!mounted) {
    return null;
  }

  return <UserIdentifierClient />;
}

function UserIdentifierClient() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    // Only identify when explicitly signed in (not undefined/loading)
    if (isSignedIn === true && userId) {
      identifyUser(userId, {
        // Only send user ID - no PII
      });
    } else if (isSignedIn === false) {
      // Only reset when explicitly signed out (not during loading)
      resetAnalytics();
    }
  }, [isSignedIn, userId]);

  return null;
}

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
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <UserIdentifier />
      {children}
    </>
  );
}
