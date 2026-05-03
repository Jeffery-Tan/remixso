"use client";

import { useAuth } from "@/providers/AuthProvider";

// 积分/试用状态横幅

export function CreditBadge() {
  const { credits, isLoading } = useAuth();

  if (isLoading || !credits) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full">
        <div className="w-16 h-5 bg-[var(--surface-container)] rounded-full animate-pulse" />
      </div>
    );
  }

  const { freeRemaining, isSubscribed } = credits;

  if (isSubscribed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Pro — {freeRemaining} left
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
      {freeRemaining} free left
    </div>
  );
}

// 试用横幅 / 升级 CTA

export function TrialBanner() {
  const { credits, isLoading } = useAuth();

  if (isLoading) return null;
  if (!credits) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30">
        <div className="h-4 w-48 bg-[var(--surface-container)] rounded animate-pulse" />
      </div>
    );
  }

  if (credits.isSubscribed) return null;

  if (credits.freeRemaining === 0) {
    return (
      <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm">
        <span className="font-medium">You&apos;re out of free generations.</span>{" "}
        <a
          href="/account"
          className="text-[var(--primary)] underline underline-offset-2"
        >
          Upgrade to Pro for $19/month
        </a>
      </div>
    );
  }

  if (credits.freeRemaining === 1 && credits.freeTotal === 1) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 text-sm">
        <span className="font-medium">Free preview (1 generation).</span>{" "}
        <span className="text-[var(--muted-foreground)]">
          Sign in to get 3 free per month.{" "}
        </span>
        <a
          href="/auth/signin"
          className="text-[var(--primary)] underline underline-offset-2"
        >
          Sign in
        </a>
      </div>
    );
  }

  return null;
}
