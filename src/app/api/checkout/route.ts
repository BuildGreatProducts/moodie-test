import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Polar product IDs - these should be configured in environment variables
const POLAR_PRODUCTS = {
  pro_monthly: process.env.POLAR_PRO_MONTHLY_PRODUCT_ID || "pro_monthly",
  pro_annual: process.env.POLAR_PRO_ANNUAL_PRODUCT_ID || "pro_annual",
  team_monthly: process.env.POLAR_TEAM_MONTHLY_PRODUCT_ID || "team_monthly",
  team_annual: process.env.POLAR_TEAM_ANNUAL_PRODUCT_ID || "team_annual",
};

const POLAR_CHECKOUT_URL = process.env.POLAR_CHECKOUT_URL || "https://polar.sh/checkout";
const POLAR_ORGANIZATION_ID = process.env.POLAR_ORGANIZATION_ID || "";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const plan = searchParams.get("plan");
    const billing = searchParams.get("billing") || "monthly";

    if (!plan || !["pro", "team"].includes(plan)) {
      return NextResponse.redirect(new URL("/pricing?error=invalid_plan", request.url));
    }

    // Get the appropriate product ID
    const productKey = `${plan}_${billing}` as keyof typeof POLAR_PRODUCTS;
    const productId = POLAR_PRODUCTS[productKey];

    if (!productId) {
      return NextResponse.redirect(new URL("/pricing?error=product_not_found", request.url));
    }

    // Construct Polar checkout URL
    // In production, this would use the Polar SDK to create a checkout session
    const checkoutUrl = new URL(POLAR_CHECKOUT_URL);
    checkoutUrl.searchParams.set("product_id", productId);
    checkoutUrl.searchParams.set("organization_id", POLAR_ORGANIZATION_ID);
    checkoutUrl.searchParams.set("customer_email", user.emailAddresses[0]?.emailAddress || "");
    checkoutUrl.searchParams.set("success_url", `${request.nextUrl.origin}/dashboard?checkout=success`);
    checkoutUrl.searchParams.set("cancel_url", `${request.nextUrl.origin}/pricing?checkout=cancelled`);

    // Add metadata to track the user
    checkoutUrl.searchParams.set("metadata[clerk_user_id]", userId);
    checkoutUrl.searchParams.set("metadata[plan]", plan);
    checkoutUrl.searchParams.set("metadata[billing]", billing);

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(new URL("/pricing?error=checkout_failed", request.url));
  }
}
