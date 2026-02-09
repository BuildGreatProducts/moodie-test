"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowRight } from "lucide-react";

export function PricingHeaderAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/sign-up"
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        Get Started
      </Link>
    );
  }

  return <PricingHeaderAuthButtonsClient />;
}

function PricingHeaderAuthButtonsClient() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        Get Started
      </Link>
    </>
  );
}

interface PricingPlanButtonProps {
  planId: string;
  cta: string;
  popular: boolean;
  billingCycle: "monthly" | "annual";
}

export function PricingPlanButton({ planId, cta, popular, billingCycle }: PricingPlanButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href={`/sign-up?plan=${planId}`}
        className={`mb-8 block w-full rounded-lg px-4 py-3 text-sm font-medium text-center transition-colors ${
          popular
            ? "bg-primary-500 text-white hover:bg-primary-600"
            : "bg-neutral-900 text-white hover:bg-neutral-800"
        }`}
      >
        {cta}
        <ArrowRight className="ml-2 inline h-4 w-4" />
      </Link>
    );
  }

  return (
    <PricingPlanButtonClient
      planId={planId}
      cta={cta}
      popular={popular}
      billingCycle={billingCycle}
    />
  );
}

function PricingPlanButtonClient({ planId, cta, popular, billingCycle }: PricingPlanButtonProps) {
  const { isSignedIn } = useAuth();

  const subscription = useQuery(
    api.subscriptions.getSubscription,
    isSignedIn ? {} : "skip"
  );

  const currentPlan = subscription?.plan || "free";
  const isCurrentPlan = currentPlan === planId;

  const handleSelectPlan = () => {
    if (!isSignedIn) {
      window.location.href = `/sign-up?plan=${planId}`;
      return;
    }

    if (planId === "team") {
      window.location.href = "mailto:sales@moodie.app?subject=Team Plan Inquiry";
      return;
    }

    if (isCurrentPlan) {
      return;
    }

    const checkoutUrl = `/api/checkout?plan=${planId}&billing=${billingCycle}`;
    window.location.href = checkoutUrl;
  };

  return (
    <button
      onClick={handleSelectPlan}
      disabled={isCurrentPlan}
      className={`mb-8 w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        isCurrentPlan
          ? "cursor-not-allowed bg-neutral-100 text-neutral-500"
          : popular
          ? "bg-primary-500 text-white hover:bg-primary-600"
          : "bg-neutral-900 text-white hover:bg-neutral-800"
      }`}
    >
      {isCurrentPlan ? "Current Plan" : cta}
      {!isCurrentPlan && <ArrowRight className="ml-2 inline h-4 w-4" />}
    </button>
  );
}
