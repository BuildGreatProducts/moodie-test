"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export function NavAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show default buttons during SSR/prerendering
  if (!mounted) {
    return (
      <>
        <Link
          href="/sign-in"
          className="hidden sm:block text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          Get Started Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </>
    );
  }

  return <NavAuthButtonsClient />;
}

function NavAuthButtonsClient() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
      >
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="hidden sm:block text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
      >
        Get Started Free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}
