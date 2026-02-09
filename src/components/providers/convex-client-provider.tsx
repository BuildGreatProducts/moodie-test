"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  // Clerk publishable keys start with pk_live_ or pk_test_ followed by base64 characters
  return /^pk_(live|test)_[a-zA-Z0-9+/=]+$/.test(key) && !key.includes("placeholder");
}

function isValidConvexUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes(".convex.cloud") && !url.includes("placeholder");
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const hasValidConfig = isValidConvexUrl(convexUrl) && isValidClerkKey(clerkKey);

  const convex = useMemo(() => {
    if (!convexUrl || !hasValidConfig) {
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl, hasValidConfig]);

  // During build time or when keys are not valid, render children without providers
  if (!hasValidConfig || !convex) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
