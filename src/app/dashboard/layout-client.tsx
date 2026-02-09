"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { LogIn } from "lucide-react";

// Note: User sync is handled by the Clerk webhook (internal mutation)
// No client-side upsertUser is needed

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

function UnauthenticatedFallback() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in page after a short delay
    const timer = setTimeout(() => {
      router.push("/sign-in");
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <LogIn className="h-12 w-12 text-neutral-400" />
      <h2 className="text-xl font-semibold text-neutral-900">
        Sign in required
      </h2>
      <p className="text-neutral-600">Redirecting to sign in...</p>
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
        <UnauthenticatedFallback />
      </Unauthenticated>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}
