"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UsageDisplay } from "@/components/subscription";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const subscription = useQuery(api.subscriptions.getSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  const reactivateSubscription = useMutation(api.subscriptions.reactivateSubscription);

  const [activeTab, setActiveTab] = useState<"account" | "subscription" | "notifications">("subscription");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "subscription" as const, label: "Subscription", icon: CreditCard },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.")) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      await reactivateSubscription();
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const plan = subscription?.plan || "free";
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionData = subscription as any;
  const status = subscriptionData?.status || "active";
  const cancelAtPeriodEnd = subscriptionData?.cancelAtPeriodEnd;
  const currentPeriodEnd = subscriptionData?.currentPeriodEnd as number | undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-neutral-900 mb-8">
        Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
              Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName || "Profile"}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-neutral-900">
                  {clerkUser?.fullName || "User"}
                </p>
                <p className="text-sm text-neutral-500">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Manage account
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
              Security
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-neutral-700">
                Your account is secured with Clerk authentication
              </span>
            </div>
            <a
              href="https://accounts.clerk.dev/user/security"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Manage security settings
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-neutral-900">
                Current Plan
              </h2>
              <div className="flex items-center gap-2">
                {status === "active" && !cancelAtPeriodEnd && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                )}
                {status === "trialing" && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Trial
                  </span>
                )}
                {status === "past_due" && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    <AlertCircle className="h-3 w-3" />
                    Past Due
                  </span>
                )}
                {cancelAtPeriodEnd && (
                  <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    Canceling
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-neutral-900">
                {planName}
              </span>
              {plan !== "free" && (
                <span className="text-neutral-500">plan</span>
              )}
            </div>

            {currentPeriodEnd && plan !== "free" && (
              <p className="text-sm text-neutral-600 mb-4">
                <Calendar className="inline h-4 w-4 mr-1" />
                {cancelAtPeriodEnd ? (
                  <>Access until {formatDate(currentPeriodEnd)}</>
                ) : (
                  <>Renews on {formatDate(currentPeriodEnd)}</>
                )}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              {plan === "free" ? (
                <Link
                  href="/pricing"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  Upgrade to Pro
                </Link>
              ) : cancelAtPeriodEnd ? (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Reactivate Subscription
                </button>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Change Plan
                  </Link>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Usage */}
          <UsageDisplay />

          {/* Billing Portal */}
          {plan !== "free" && (
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
                Billing
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                Manage your payment methods, view invoices, and update billing information.
              </p>
              <a
                href="#" // In production, this would be the Polar customer portal URL
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Open billing portal
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-neutral-900 mb-4">
              Email Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Client comments</p>
                  <p className="text-sm text-neutral-500">
                    Get notified when clients leave comments on your moodboards
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Usage alerts</p>
                  <p className="text-sm text-neutral-500">
                    Get notified when approaching plan limits
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Product updates</p>
                  <p className="text-sm text-neutral-500">
                    Receive news about new features and improvements
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
