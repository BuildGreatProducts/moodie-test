import { type ReactNode } from "react";
import { DashboardLayoutClient } from "./layout-client";

// Force dynamic rendering for all dashboard pages to ensure Convex provider is available
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
