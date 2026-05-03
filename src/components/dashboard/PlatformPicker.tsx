"use client";

import { useGenerationStore } from "@/store/generation-store";
import { PLATFORM_META, type PlatformCode } from "@/types/platform";
import { PLATFORMS } from "@/types/platform";

// 品牌 SVG 图标组件 —— 各平台真实 logo
function PlatformIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const cls = "text-[var(--on-surface-variant)] group-hover:scale-110 transition-transform duration-300";
  switch (platform) {
    case "twitter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1" />
        </svg>
      );
    case "newsletter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "youtube-shorts":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cls}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}

export function PlatformPicker() {
  const { selectedPlatforms, togglePlatform, status } = useGenerationStore();
  const isProcessing = status !== "idle" && status !== "error" && status !== "done";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--on-surface-variant)]" id="platform-picker-label">
          Select platforms
        </h3>
        {!isProcessing && (
          <button
            className="text-[13px] font-semibold text-[var(--primary)] hover:underline"
            aria-label={PLATFORMS.length === selectedPlatforms.length ? "Deselect all platforms" : "Select all platforms"}
            onClick={() => {
              const allSelected = PLATFORMS.length === selectedPlatforms.length;
              PLATFORMS.forEach((p) => {
                if (allSelected) {
                  if (selectedPlatforms.includes(p)) togglePlatform(p);
                } else {
                  if (!selectedPlatforms.includes(p)) togglePlatform(p);
                }
              });
            }}
          >
            {PLATFORMS.length === selectedPlatforms.length ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-labelledby="platform-picker-label">
        {PLATFORMS.map((platform) => {
          const meta = PLATFORM_META[platform as PlatformCode];
          const isSelected = selectedPlatforms.includes(platform);

          return (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              disabled={isProcessing}
              aria-label={`${meta.label}: ${meta.description}`}
              aria-pressed={isSelected}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center ${
                isSelected
                  ? "border-[var(--primary)] shadow-sm bg-[var(--primary)]/5"
                  : "border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] hover:border-[var(--outline)]"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* 选中态背景渐变 */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-2xl" />
              )}
              <div
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "bg-[var(--surface-container)] text-[var(--on-surface-variant)]"
                }`}
              >
                <PlatformIcon platform={platform} size={20} />
              </div>
              <div className="relative">
                <div className={`text-sm font-medium transition-colors ${isSelected ? "text-[var(--primary)]" : "text-[var(--on-surface-variant)]"}`}>
                  {meta.label}
                </div>
                <div className="text-[11px] text-[var(--on-surface-variant)]/60 leading-tight mt-0.5 max-w-[160px]">
                  {meta.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
