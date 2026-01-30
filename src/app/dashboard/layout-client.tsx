"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

function UserSync() {
  const { user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (user) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl,
      });
    }
  }, [user, upsertUser]);

  return null;
}

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
        <UserSync />
        <AppShell>{children}</AppShell>
      </Authenticated>
    </>
  );
}
