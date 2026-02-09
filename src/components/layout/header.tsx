"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Bell, Menu, User } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

function LoadingAvatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
    </div>
  );
}

function FallbackAvatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
      <User className="h-4 w-4 text-neutral-500" />
    </div>
  );
}

function UserAvatar() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingAvatar />;
  }

  if (isSignedIn) {
    return (
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />
    );
  }

  return <FallbackAvatar />;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 hover:bg-neutral-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-neutral-600" />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 hover:bg-neutral-100" aria-label="Notifications">
          <Bell className="h-5 w-5 text-neutral-600" />
          {/* Notification badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500" />
        </button>

        <UserAvatar />
      </div>
    </header>
  );
}
