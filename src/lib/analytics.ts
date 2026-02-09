/**
 * Analytics integration for Moodie
 *
 * This module provides a flexible analytics interface that can be configured
 * to work with various analytics providers (PostHog, Mixpanel, Google Analytics, etc.)
 *
 * Configuration:
 * Set NEXT_PUBLIC_ANALYTICS_PROVIDER and NEXT_PUBLIC_ANALYTICS_KEY in your environment.
 */

type EventProperties = Record<string, string | number | boolean | undefined>;

// Analytics provider types
type AnalyticsProvider = "posthog" | "mixpanel" | "ga" | "none";

// Get provider from environment
const getProvider = (): AnalyticsProvider => {
  if (typeof window === "undefined") return "none";
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  if (provider === "posthog" || provider === "mixpanel" || provider === "ga") {
    return provider;
  }
  return "none";
};

// Check if analytics is enabled
const isEnabled = (): boolean => {
  return getProvider() !== "none" && !!process.env.NEXT_PUBLIC_ANALYTICS_KEY;
};

/**
 * Track a page view
 */
export function trackPageView(path: string): void {
  if (!isEnabled()) return;

  const provider = getProvider();

  try {
    switch (provider) {
      case "posthog":
        // PostHog pageview
        if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (event: string, props: Record<string, string>) => void } }).posthog) {
          (window as unknown as { posthog: { capture: (event: string, props: Record<string, string>) => void } }).posthog.capture("$pageview", { $current_url: path });
        }
        break;
      case "mixpanel":
        // Mixpanel pageview
        if (typeof window !== "undefined" && (window as unknown as { mixpanel?: { track: (event: string, props: Record<string, string>) => void } }).mixpanel) {
          (window as unknown as { mixpanel: { track: (event: string, props: Record<string, string>) => void } }).mixpanel.track("Page View", { path });
        }
        break;
      case "ga":
        // Google Analytics pageview
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "page_view", { page_path: path });
        }
        break;
    }
  } catch (error) {
    console.warn("Analytics pageview error:", error);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  if (!isEnabled()) return;

  const provider = getProvider();

  try {
    switch (provider) {
      case "posthog":
        if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (event: string, props?: EventProperties) => void } }).posthog) {
          (window as unknown as { posthog: { capture: (event: string, props?: EventProperties) => void } }).posthog.capture(eventName, properties);
        }
        break;
      case "mixpanel":
        if (typeof window !== "undefined" && (window as unknown as { mixpanel?: { track: (event: string, props?: EventProperties) => void } }).mixpanel) {
          (window as unknown as { mixpanel: { track: (event: string, props?: EventProperties) => void } }).mixpanel.track(eventName, properties);
        }
        break;
      case "ga":
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", eventName, properties);
        }
        break;
    }
  } catch (error) {
    console.warn("Analytics event error:", error);
  }
}

/**
 * Identify a user for analytics
 */
export function identifyUser(userId: string, traits?: EventProperties): void {
  if (!isEnabled()) return;

  const provider = getProvider();

  try {
    switch (provider) {
      case "posthog":
        if (typeof window !== "undefined" && (window as unknown as { posthog?: { identify: (id: string, props?: EventProperties) => void } }).posthog) {
          (window as unknown as { posthog: { identify: (id: string, props?: EventProperties) => void } }).posthog.identify(userId, traits);
        }
        break;
      case "mixpanel":
        if (typeof window !== "undefined" && (window as unknown as { mixpanel?: { identify: (id: string) => void; people: { set: (props?: EventProperties) => void } } }).mixpanel) {
          const mixpanel = (window as unknown as { mixpanel: { identify: (id: string) => void; people: { set: (props?: EventProperties) => void } } }).mixpanel;
          mixpanel.identify(userId);
          if (traits) {
            mixpanel.people.set(traits);
          }
        }
        break;
      case "ga":
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("set", { user_id: userId });
        }
        break;
    }
  } catch (error) {
    console.warn("Analytics identify error:", error);
  }
}

/**
 * Reset analytics (for logout)
 */
export function resetAnalytics(): void {
  if (!isEnabled()) return;

  const provider = getProvider();

  try {
    switch (provider) {
      case "posthog":
        if (typeof window !== "undefined" && (window as unknown as { posthog?: { reset: () => void } }).posthog) {
          (window as unknown as { posthog: { reset: () => void } }).posthog.reset();
        }
        break;
      case "mixpanel":
        if (typeof window !== "undefined" && (window as unknown as { mixpanel?: { reset: () => void } }).mixpanel) {
          (window as unknown as { mixpanel: { reset: () => void } }).mixpanel.reset();
        }
        break;
      case "ga":
        // GA doesn't have a reset function
        break;
    }
  } catch (error) {
    console.warn("Analytics reset error:", error);
  }
}

// Pre-defined event names for consistency
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",

  // Onboarding events
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_SKIPPED: "onboarding_skipped",

  // Project events
  PROJECT_CREATED: "project_created",
  PROJECT_UPDATED: "project_updated",
  PROJECT_DELETED: "project_deleted",
  PROJECT_ARCHIVED: "project_archived",

  // Moodboard events
  MOODBOARD_CREATED: "moodboard_created",
  MOODBOARD_UPDATED: "moodboard_updated",
  MOODBOARD_DELETED: "moodboard_deleted",
  MOODBOARD_SHARED: "moodboard_shared",

  // Product events
  PRODUCT_ADDED: "product_added",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_DELETED: "product_deleted",

  // AI events
  AI_IMAGE_GENERATED: "ai_image_generated",
  AI_SUGGESTION_REQUESTED: "ai_suggestion_requested",
  AI_CHAT_MESSAGE_SENT: "ai_chat_message_sent",

  // Client sharing events
  CLIENT_LINK_CREATED: "client_link_created",
  CLIENT_COMMENT_ADDED: "client_comment_added",
  CLIENT_VIEW: "client_view",

  // Subscription events
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",

  // Feature usage
  CANVAS_IMAGE_UPLOADED: "canvas_image_uploaded",
  CANVAS_ELEMENT_ADDED: "canvas_element_added",
  EXPORT_CREATED: "export_created",
} as const;
