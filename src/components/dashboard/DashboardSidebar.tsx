"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Dashboard 侧边栏导航

interface DashboardSidebarProps {
  activeTab: "workspace" | "history";
  onTabChange: (tab: "workspace" | "history") => void;
  onClose?: () => void;
}

export function DashboardSidebar({ activeTab, onTabChange, onClose }: DashboardSidebarProps) {
  const { user, profile, signOut } = useAuth();
  const [imgError, setImgError] = useState(false);

  const tabs = [
    {
      id: "workspace" as const,
      label: "Workspace",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
    {
      id: "history" as const,
      label: "History",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--outline-variant)]/20 bg-[var(--surface-container-lowest)]/60 backdrop-blur-xl flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--outline-variant)]/20 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-headline)] text-lg font-bold tracking-tight text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
          RemixSo
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 用户信息 */}
      {user && (
        <div className="px-4 py-3 border-t border-[var(--outline-variant)]/20 space-y-2">
          <div className="flex items-center gap-3">
            {profile?.avatarUrl && !imgError ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <span className="text-xs font-medium text-[var(--primary)]">
                  {(profile?.fullName ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--foreground)] truncate">
                {profile?.fullName ?? "User"}
              </p>
              <p className="text-[11px] text-[var(--on-surface-variant)] truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Link
              href="/account"
              className="flex-1 text-center text-[11px] font-medium text-[var(--on-surface-variant)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container)] rounded-lg py-1.5 transition-colors"
            >
              Account
            </Link>
            <button
              onClick={() => signOut()}
              className="flex-1 text-center text-[11px] font-medium text-[var(--on-surface-variant)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
