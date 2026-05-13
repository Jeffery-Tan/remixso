"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export function ReferralBanner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { user, isLoading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref || isLoading) return;
    // 已登录用户由 RefAutoApply 处理，这里只提示未登录用户
    if (user) return;
    // 本次会话已关闭过就不再显示
    if (sessionStorage.getItem("remixso-ref-banner-dismissed") === ref) return;
    setVisible(true);
  }, [ref, user, isLoading]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    if (ref) sessionStorage.setItem("remixso-ref-banner-dismissed", ref);
  };

  return (
    <div className="bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary-fixed-dim)]/10 to-[var(--primary)]/10 border-b border-[var(--primary)]/20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-sm text-[var(--foreground)] truncate">
            <span className="font-semibold">You&apos;ve been invited!</span>{" "}
            <span className="text-[var(--on-surface-variant)]">
              Sign in to claim 3 free extra generations.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/auth/signin"
            className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold px-4 py-1.5 transition-all"
          >
            Sign in
          </Link>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container)] transition-colors"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
