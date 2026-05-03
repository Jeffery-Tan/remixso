"use client";

import { useState, useEffect } from "react";
import { useGenerationStore } from "@/store/generation-store";
import { useAuth } from "@/providers/AuthProvider";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// 内容输入组件 —— 文本区 + URL 抓取

interface ContentInputProps {
  placeholder?: string;
}

export function ContentInput({ placeholder }: ContentInputProps) {
  const {
    sourceContent,
    sourceTitle,
    sourceUrl,
    setSourceContent,
    setSourceTitle,
    setSourceUrl,
    status,
  } = useGenerationStore();

  const { credits } = useAuth();
  const isPro = credits?.isSubscribed ?? false;
  const charLimit = isPro ? 15000 : 5000;
  const estimatedTokens = Math.round(sourceContent.length * 0.25);
  const showWarning = !isPro && sourceContent.length >= 5000;

  const isProcessing =
    status !== "idle" && status !== "error" && status !== "done";

  // URL 抓取状态
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 草稿自动保存（300ms 防抖）
  useEffect(() => {
    if (status === "idle" && sourceContent.trim()) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          "remixso_autosave",
          JSON.stringify({ content: sourceContent, title: sourceTitle })
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sourceContent, sourceTitle, status]);

  // 恢复草稿
  useEffect(() => {
    if (!sourceContent) {
      try {
        const saved = localStorage.getItem("remixso_autosave");
        if (saved) {
          const { content, title } = JSON.parse(saved);
          if (content) setSourceContent(content);
          if (title) setSourceTitle(title);
        }
      } catch {
        // localStorage 数据损坏，忽略
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFetchUrl = async () => {
    if (!sourceUrl.trim()) return;
    setIsFetching(true);
    setFetchError(null);

    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFetchError(data.error || "Failed to fetch URL");
        return;
      }

      const data = await res.json();
      setSourceContent(data.content);
      setSourceTitle(data.title);
    } catch {
      setFetchError("Network error fetching URL");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 标题（可选） */}
      <label className="sr-only" htmlFor="content-title">Title (optional)</label>
      <input
        id="content-title"
        type="text"
        placeholder="Title (optional)"
        value={sourceTitle ?? ""}
        onChange={(e) => setSourceTitle(e.target.value || null)}
        disabled={isProcessing}
        className="w-full rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2.5 text-sm placeholder:text-[var(--on-surface-variant)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all"
      />

      {/* 文本输入 */}
      <div className="relative">
        <Textarea
          placeholder={placeholder ?? "Paste your article, blog post, or any long-form content here..."}
          value={sourceContent}
          onChange={(e) => setSourceContent(e.target.value)}
          disabled={isProcessing}
          className="min-h-[200px] rounded-xl border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all resize-none"
          maxLength={isPro ? 15000 : undefined}
        />
      </div>

      {/* 字数统计 */}
      <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
        <span>
          {sourceContent.length} / {charLimit.toLocaleString()} chars · ~{estimatedTokens} tokens
        </span>
      </div>

      {/* Free 用户超限警告 */}
      {showWarning && (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-400">
          Free plan supports up to 5,000 characters.{" "}
          <a href="/#pricing" className="underline font-medium text-amber-800 dark:text-amber-300">
            Upgrade to Pro
          </a>{" "}
          for 15,000.
        </div>
      )}

      {/* URL 抓取 —— 始终可见 */}
      <div className="space-y-2">
        <label className="sr-only" htmlFor="content-url">Blog post URL</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="content-url"
            type="url"
            placeholder="Paste a blog post URL to auto-fetch..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            disabled={isProcessing}
            className="flex-1 rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2.5 text-sm placeholder:text-[var(--on-surface-variant)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchUrl}
            disabled={isFetching || !sourceUrl.trim() || isProcessing}
            className="sm:shrink-0 rounded-xl"
          >
            {isFetching ? (
              <>
                <Spinner className="mr-2" />
                Fetching...
              </>
            ) : (
              "Fetch"
            )}
          </Button>
        </div>

        {fetchError && (
          <p className="text-xs text-red-500">{fetchError}</p>
        )}
      </div>
    </div>
  );
}
