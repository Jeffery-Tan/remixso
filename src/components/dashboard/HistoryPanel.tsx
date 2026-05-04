"use client";

import { useEffect, useState } from "react";
import { useHistoryStore } from "@/store/history-store";
import { useGenerationStore } from "@/store/generation-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { PLATFORM_META } from "@/types/platform";
import type { PlatformCode } from "@/types/platform";
import type { HistoryEntry } from "@/types/generation";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

// 历史记录面板 —— 点击展开查看已保存的输出结果

interface HistoryPanelProps {
  onLoadEntry: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function platformColor(platform: PlatformCode): string {
  const colors: Record<string, string> = {
    twitter: "bg-blue-100 text-blue-700",
    linkedin: "bg-blue-200 text-blue-800",
    instagram: "bg-pink-100 text-pink-700",
    newsletter: "bg-green-100 text-green-700",
    tiktok: "bg-gray-100 text-gray-700",
    "youtube-shorts": "bg-red-100 text-red-700",
  };
  return colors[platform] ?? "bg-gray-100 text-gray-700";
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function HistoryPanel({ onLoadEntry }: HistoryPanelProps) {
  const { entries, isLoading, error, fetchHistory, deleteEntry } =
    useHistoryStore();
  const loadHistoryEntry = useGenerationStore((s) => s.loadHistoryEntry);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setActiveOutputTab(null);
    } else {
      setExpandedId(id);
      // 默认选中第一个有内容的平台
      const entry = entries.find((e) => e.id === id);
      if (entry && entry.outputs.length > 0) {
        setActiveOutputTab(entry.outputs[0].platform);
      } else {
        setActiveOutputTab(null);
      }
    }
  };

  const handleLoad = (entry: HistoryEntry) => {
    loadHistoryEntry(entry);
    onLoadEntry();
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    await deleteEntry(id);
    setDeletingId(null);
    if (expandedId === id) setExpandedId(null);
  };

  const handleCopy = async (platform: string, content: string) => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold tracking-tight mb-8">
        History
      </h1>

      {isLoading && entries.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--outline-variant)]/30 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400 mb-4">
          {error}
          <button
            onClick={() => fetchHistory()}
            className="ml-2 underline text-red-800 dark:text-red-400"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && entries.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[var(--surface-container)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--on-surface-variant)]">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold mb-1">
            No generations yet
          </h2>
          <p className="text-sm text-[var(--on-surface-variant)]">
            Start remixing content to see your history here.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="glass-card rounded-2xl border-[var(--outline-variant)]/30 overflow-hidden"
              >
                {/* 条目头部 —— 始终可见 */}
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="w-full text-left p-5 hover:bg-[var(--surface-container-low)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[var(--on-surface-variant)]">
                          {formatDate(entry.createdAt)}
                        </span>
                        {entry.sourceType === "url" && (
                          <Badge variant="outline" className="text-[10px]">
                            URL
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-1">
                        {entry.sourceTitle ?? truncate(entry.sourceContent, 80)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.platforms.map((p) => {
                          const meta = PLATFORM_META[p as PlatformCode];
                          return (
                            <span
                              key={p}
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${platformColor(p as PlatformCode)}`}
                            >
                              {meta?.shortLabel ?? p}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-[var(--on-surface-variant)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* 展开区 —— Tab 切换各平台输出 */}
                {isExpanded && (
                  <div className="space-y-0 border-t border-[var(--outline-variant)]/20">
                    {entry.outputs.length > 0 ? (
                      <>
                        {/* Tab 栏 */}
                        <div className="flex items-center border-b border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]/50 px-3 overflow-x-auto">
                          {entry.outputs.map((output) => {
                            const meta = PLATFORM_META[output.platform as PlatformCode];
                            const isActive = (activeOutputTab ?? entry.outputs[0]?.platform) === output.platform;
                            return (
                              <button
                                key={output.platform}
                                onClick={() => setActiveOutputTab(output.platform)}
                                className={cn(
                                  "shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                                  isActive
                                    ? "border-[var(--primary)] text-[var(--primary)]"
                                    : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--foreground)]"
                                )}
                              >
                                {meta?.label ?? output.platform}
                              </button>
                            );
                          })}
                        </div>

                        {/* 内容区 */}
                        {(() => {
                          const activeTab = activeOutputTab ?? entry.outputs[0]?.platform;
                          const activeOutput = entry.outputs.find((o) => o.platform === activeTab);
                          if (!activeOutput) return null;
                          const meta = PLATFORM_META[activeOutput.platform as PlatformCode];
                          const isCopied = copiedPlatform === activeOutput.platform;
                          return (
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold">
                                  {meta?.label ?? activeOutput.platform}
                                </span>
                                <span className="text-xs text-[var(--on-surface-variant)]">
                                  {activeOutput.content.length} chars
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap text-sm leading-relaxed min-h-[100px] max-h-[400px] overflow-y-auto bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/20 p-4">
                                {activeOutput.content}
                              </div>
                              <div className="mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(activeOutput.platform, activeOutput.content)}
                                  className="text-xs h-7"
                                >
                                  {isCopied ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="p-8 text-center text-sm text-[var(--on-surface-variant)]">
                        No outputs recorded for this generation.
                      </div>
                    )}

                    {/* 操作栏 */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--outline-variant)]/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoad(entry)}
                        className="text-xs"
                      >
                        Load into Workspace
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(entry.id)}
                        disabled={deletingId === entry.id}
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 删除确认弹窗 */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Delete this generation?"
        description="This will permanently remove the generation record and all its outputs. This action cannot be undone."
      >
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            className="bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-[var(--destructive-foreground)]"
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
