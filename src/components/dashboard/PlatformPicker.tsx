"use client";

import { useGenerationStore } from "@/store/generation-store";
import { PLATFORM_META, type PlatformCode } from "@/types/platform";
import { PLATFORMS } from "@/types/platform";
import { PlatformIcon } from "@/components/icons/PlatformIcon";

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
