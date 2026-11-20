"use client";

import Link from "next/link";
import { Home, RefreshCw, WifiOff } from "lucide-react";
import Button from "@/components/Button";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export default function OfflinePage() {
  const { isOnline } = useOfflineStatus();

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-theme-border bg-theme-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stellar-blue/10 text-stellar-blue">
          <WifiOff className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-semibold text-theme-heading">
          {isOnline ? "You're back online" : "You're offline"}
        </h1>
        <p className="mt-2 text-sm text-theme-text">
          {isOnline
            ? "Your connection is back. Reload the page to pick up where you left off."
            : "This page isn't available offline. Check your internet connection and try again."}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-theme-border bg-theme-card px-4 py-2 text-sm font-medium text-theme-heading transition-colors hover:border-stellar-blue"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
