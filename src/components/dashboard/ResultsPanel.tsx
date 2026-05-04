"use client";

import { useState, useEffect } from "react";
import { useGenerationStore } from "@/store/generation-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PlatformCode } from "@/types/platform";
import { PLATFORM_META } from "@/types/platform";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// 结果面板 —— Tab 切换各平台生成结果

export function ResultsPanel() {
  const { results, status, selectedPlatforms, platformErrors, startRefine, retryPlatform } = useGenerationStore();
  const { addToast } = useToast();
  const [retrying, setRetrying] = useState<string | null>(null);

  const platformsWithResults = selectedPlatforms.filter((p) => results[p]);
  const failedPlatforms = selectedPlatforms.filter((p) => platformErrors[p] && !results[p]);

  // 所有 hooks 必须在条件返回之前调用
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  useEffect(() => {
    if (platformsWithResults.length > 0) {
      setActivePlatform((prev) => {
        if (!prev || !results[prev as PlatformCode]) return platformsWithResults[0];
        return prev;
      });
    }
  }, [platformsWithResults, results]);

  if (status !== "done") return null;

  // 没有任何结果也没有失败，不显示
  if (platformsWithResults.length === 0 && failedPlatforms.length === 0) return null;

  const handleRetry = async (platform: string) => {
    setRetrying(platform);
    await retryPlatform(platform as never);
    setRetrying(null);
  };

  const currentResult = activePlatform ? results[activePlatform as PlatformCode] : null;
  const meta = activePlatform ? PLATFORM_META[activePlatform as PlatformCode] : null;

  const handleCopy = async () => {
    if (!currentResult) return;
    try {
      await navigator.clipboard.writeText(currentResult.content);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  return (
    <div className="rounded-xl border border-[var(--outline-variant)]/50 overflow-hidden bg-[var(--surface-container-lowest)]">
      {/* Tab 栏 —— 仅在至少有 1 个成功结果时显示 */}
      {platformsWithResults.length > 0 && (
        <>
          <div role="tablist" className="flex items-center border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]/50 px-2 overflow-x-auto">
            {platformsWithResults.map((platform) => {
              const pmeta = PLATFORM_META[platform as PlatformCode];
              const result = results[platform]!;
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePlatform(platform)}
                  className={cn(
                    "shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative",
                    isActive
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--foreground)]"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {pmeta?.label ?? platform}
                    {result.isEdited && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 内容区 */}
          {currentResult && meta && (
            <div role="tabpanel" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{meta.label}</span>
                  {currentResult.isEdited && (
                    <Badge variant="outline" className="text-[10px]">edited</Badge>
                  )}
                </div>
                <span className="text-xs text-[var(--on-surface-variant)]">{currentResult.charCount} chars</span>
              </div>

              <div className="whitespace-pre-wrap text-sm leading-relaxed min-h-[120px] max-h-[400px] overflow-y-auto bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/20 p-4">
                {currentResult.content}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7">Copy</Button>
                <Button variant="ghost" size="sm" onClick={() => startRefine(activePlatform as never)} className="text-xs h-7">Refine</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 失败平台卡片 */}
      {failedPlatforms.length > 0 && (
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-widest">Failed ({failedPlatforms.length})</p>
          {failedPlatforms.map((platform) => {
            const fmeta = PLATFORM_META[platform as PlatformCode];
            const isRetrying = retrying === platform;
            return (
              <div key={platform} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="min-w-0">
                  <span className="text-sm font-medium">{fmeta?.label ?? platform}</span>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate">{platformErrors[platform]}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRetry(platform)} disabled={isRetrying} className="shrink-0 text-xs h-7">
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
