"use client";

import { useGenerationStore } from "@/store/generation-store";
import { PLATFORM_META } from "@/types/platform";
import type { PlatformCode } from "@/types/platform";

// 进度指示器 —— 嵌套旋转环 + 动态光点 + 各平台实时状态

const PLATFORM_ICON: Record<string, string> = {
  twitter: "𝕏",
  linkedin: "💼",
  instagram: "📸",
  newsletter: "📧",
  tiktok: "🎵",
  "youtube-shorts": "▶️",
};

function StatusDot({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]" />;
    case "generating":
      return (
        <span className="w-4 h-4 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      );
    case "done":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-green-500">
          <path d="M13.3 4.3L6 11.6 2.7 8.3l1.4-1.4L6 8.8l5.9-5.9z" />
        </svg>
      );
    case "error":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-red-500">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)]" />;
  }
}

export function GenerationProgress() {
  const { status, selectedPlatforms, platformStatuses } = useGenerationStore();

  if (status === "idle" || status === "error" || status === "done") {
    return null;
  }

  const platformLabels = selectedPlatforms
    .map((p) => PLATFORM_META[p as PlatformCode].shortLabel)
    .join(", ");

  return (
    <div role="status" aria-live="polite" aria-label={`Generating content for ${platformLabels}`} className="glass-card-strong rounded-3xl p-8 shadow-xl relative overflow-hidden text-center">
      {/* 动态光点背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[20%] w-24 h-24 bg-[var(--primary-fixed)] rounded-full mix-blend-multiply blur-2xl animate-blob" />
        <div
          className="absolute top-[20%] right-[20%] w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply blur-2xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[10%] left-[40%] w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply blur-2xl animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* 嵌套旋转环 + 图标 */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/20" />
          <div
            className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-purple-300/30 border-b-transparent animate-spin"
            style={{ animationDuration: "3s", animationDirection: "reverse" }}
          />
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <line x1="1" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <polygon points="7,5 7,19 14,12" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.25" strokeLinejoin="round" />
              <line x1="14" y1="8" x2="23" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
              <line x1="14" y1="12" x2="23" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <line x1="14" y1="16" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="font-[family-name:var(--font-headline)] text-xl font-bold tracking-tight mb-1">
          {status === "analyzing"
            ? "Analyzing your writing voice..."
            : `Generating ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""} in parallel`}
        </h3>
        <p className="text-sm text-[var(--on-surface-variant)] mb-6 max-w-[280px]">
          {status === "analyzing"
            ? "Understanding tone, pacing, and signature style"
            : platformLabels}
        </p>

        {/* 各平台状态卡片 */}
        <div className="w-full max-w-[280px] space-y-2 text-left">
          {selectedPlatforms.map((platform) => {
            const meta = PLATFORM_META[platform as PlatformCode];
            const ps = platformStatuses[platform] ?? "pending";
            return (
              <div
                key={platform}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  ps === "generating"
                    ? "bg-[var(--surface-bright)]/60 dark:bg-[var(--surface-container)]/60 border-[var(--outline-variant)]/20 dark:border-[var(--outline-variant)]/30 shadow-sm backdrop-blur-sm"
                    : ps === "done"
                      ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                      : ps === "error"
                        ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                        : "opacity-50 border-transparent"
                }`}
              >
                <span className="text-base shrink-0">{PLATFORM_ICON[platform] ?? "📄"}</span>
                <span className="text-sm font-medium flex-1 truncate">{meta?.label ?? platform}</span>
                <StatusDot status={ps} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
