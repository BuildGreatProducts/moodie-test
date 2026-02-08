"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

// Note: User sync is handled by the Clerk webhook (internal mutation)
// No client-side upsertUser is needed

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Check if providers are configured
  const hasProviders = process.env.NEXT_PUBLIC_CONVEX_URL;

  // During SSR or when not hydrated, render a simple shell to avoid hydration mismatch
  if (!hydrated || !hasProviders) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Unauthenticated>
        <LoadingScreen />
      </Unauthenticated>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}
