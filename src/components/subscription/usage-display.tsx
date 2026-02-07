"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, FolderKanban, Layout, Package, Zap } from "lucide-react";
import Link from "next/link";

interface UsageBarProps {
  used: number;
  limit: number;
  label: string;
  icon: React.ReactNode;
}

function UsageBar({ used, limit, label, icon }: UsageBarProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && used >= limit;

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-neutral-600">{label}</span>
          <span
            className={`text-sm font-medium ${
              isAtLimit
                ? "text-red-600"
                : isNearLimit
                ? "text-orange-600"
                : "text-neutral-900"
            }`}
          >
            {used} / {isUnlimited ? "∞" : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="h-1.5 w-full rounded-full bg-neutral-100">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isAtLimit
                  ? "bg-red-500"
                  : isNearLimit
                  ? "bg-orange-500"
                  : "bg-primary-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface UsageDisplayProps {
  compact?: boolean;
}

export function UsageDisplay({ compact = false }: UsageDisplayProps) {
  const subscription = useQuery(api.subscriptions.getSubscription);
  const usage = useQuery(api.subscriptions.getUsageStats);

  if (!subscription || !usage) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded mb-3" />
        <div className="space-y-3">
          <div className="h-8 bg-neutral-100 rounded" />
          <div className="h-8 bg-neutral-100 rounded" />
          <div className="h-8 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  const plan: "free" | "pro" | "team" = (subscription?.plan as "free" | "pro" | "team") || "free";
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  if (compact) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-neutral-900">
              {planName} Plan
            </span>
          </div>
          {plan === "free" && (
            <Link
              href="/pricing"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Upgrade
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-neutral-900">
              {usage.projects.used}
              <span className="text-sm font-normal text-neutral-500">
                /{usage.projects.limit === -1 ? "∞" : usage.projects.limit}
              </span>
            </p>
            <p className="text-xs text-neutral-500">Projects</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-900">
              {usage.aiGenerations.used}
              <span className="text-sm font-normal text-neutral-500">
                /{usage.aiGenerations.limit === -1 ? "∞" : usage.aiGenerations.limit}
              </span>
            </p>
            <p className="text-xs text-neutral-500">AI Gens</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-neutral-900">
            Usage
          </h3>
          <p className="text-sm text-neutral-500">
            {planName} plan •{" "}
            {subscription.status === "active"
              ? "Active"
              : subscription.status === "trialing"
              ? "Trial"
              : subscription.status}
          </p>
        </div>
        {plan !== "team" && plan !== "pro" && (
          <Link
            href="/pricing"
            className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <UsageBar
          used={usage.projects.used}
          limit={usage.projects.limit}
          label="Projects"
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <UsageBar
          used={usage.moodboards.used}
          limit={usage.moodboards.limit}
          label="Moodboards"
          icon={<Layout className="h-4 w-4" />}
        />
        <UsageBar
          used={usage.aiGenerations.used}
          limit={usage.aiGenerations.limit}
          label="AI Generations"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <UsageBar
          used={usage.products.used}
          limit={usage.products.limit}
          label="Products"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {plan === "free" && (
        <div className="mt-6 rounded-lg bg-gradient-to-r from-primary-50 to-purple-50 p-4">
          <p className="text-sm text-neutral-700">
            <strong>Unlock more</strong> with Pro: 10 projects, 50 moodboards, 100 AI generations, and priority support.
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View plans →
          </Link>
        </div>
      )}
    </div>
  );
}
