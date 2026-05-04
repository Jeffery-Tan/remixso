"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGenerationStore } from "@/store/generation-store";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PLATFORM_META } from "@/types/platform";
import type { PlatformCode } from "@/types/platform";
import { Zap, Briefcase, Anchor, Scissors } from "lucide-react";

// Quick Prompts 预设映射 —— 前端便利功能，注入详细指令到 textarea
const QUICK_PROMPTS = [
  {
    label: "Make it punchier",
    icon: Zap,
    instruction:
      "Rewrite to be more punchy and energetic. Use shorter sentences, stronger verbs, and more assertive language. Cut filler words and hedging phrases.",
  },
  {
    label: "More professional",
    icon: Briefcase,
    instruction:
      "Rewrite to sound polished and authoritative. Use precise vocabulary, remove casual expressions and emojis. Maintain a confident, expert tone.",
  },
  {
    label: "Add hook",
    icon: Anchor,
    instruction:
      "Add a compelling opening hook — a bold claim, surprising statistic, or curiosity gap that makes readers want to engage immediately.",
  },
  {
    label: "Shorter",
    icon: Scissors,
    instruction:
      "Condense this to be more concise. Keep only the strongest points and most impactful language. Target about half the current length.",
  },
];

// 微调侧边抽屉 —— 玻璃拟态面板 + Quick Prompts

export function RefineDrawer() {
  const {
    refiningPlatform,
    refineInstruction,
    isRefining,
    error,
    preRefineContent,
    results,
    setRefineInstruction,
    refine,
    cancelRefine,
    setError,
  } = useGenerationStore();

  const [closing, setClosing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const prevPlatform = useRef(refiningPlatform);

  // 滑入/滑出动画状态管理
  useEffect(() => {
    if (refiningPlatform) {
      setClosing(false);
      setAnimating(false);
      prevPlatform.current = refiningPlatform;
      // 下一帧触发滑入
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else if (prevPlatform.current) {
      setAnimating(false);
      setClosing(true);
      const timer = setTimeout(() => {
        prevPlatform.current = null;
        setClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [refiningPlatform]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isVisible = !!refiningPlatform || closing;
  if (!isVisible && !prevPlatform.current) return null;
  if (!mounted) return null;

  const platform = ((refiningPlatform || prevPlatform.current) ?? "") as PlatformCode;
  const meta = PLATFORM_META[platform];
  const currentContent = results[platform]?.content ?? "";

  const handleRefine = () => {
    if (!refineInstruction.trim()) return;
    refine(platform);
  };

  const handleQuickPrompt = (instruction: string) => {
    setRefineInstruction(instruction);
  };

  return createPortal(
    <>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          animating && !closing
            ? "bg-[var(--foreground)]/10 backdrop-blur-[2px]"
            : "bg-transparent backdrop-blur-0"
        }`}
        onClick={cancelRefine}
        aria-hidden="true"
      />

      {/* 抽屉面板 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Refine ${meta?.label ?? platform}`}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-[var(--surface-container-lowest)]/90 backdrop-blur-3xl border-l border-[var(--outline-variant)]/50 shadow-[-20px_0_40px_rgba(0,0,0,0.03)] flex flex-col transition-transform duration-300 ease-out ${
          animating && !closing ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 头部 */}
        <header className="px-6 py-5 border-b border-[var(--outline-variant)]/50 bg-[var(--surface-container-lowest)]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--primary)]"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold tracking-tight">
              Refine {meta?.label ?? platform}
            </h2>
          </div>
          <button
            onClick={cancelRefine}
            className="p-2 rounded-full hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 可滚动内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {preRefineContent ? (
            <>
              {/* Refine 完成 —— 前后对比 */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h2 className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Refined!
                  </h2>
                </div>
              </section>

              {/* Before */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--outline)] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--outline-variant)]" />
                  Before
                </h3>
                <div className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--on-surface-variant)] line-clamp-5">
                    {preRefineContent}
                  </p>
                </div>
              </section>

              {/* After */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--primary)] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  After
                </h3>
                <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentContent}
                  </p>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* 当前版本 */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--outline)] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--outline-variant)]" />
                  Current version
                </h3>
                <div className="bg-[var(--surface-container-lowest)] border border-[var(--foreground)]/5 p-5 rounded-lg shadow-[4px_4px_0px_0px_rgba(25,28,30,0.03)]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {currentContent}
                  </p>
                </div>
              </section>

              {/* Quick Prompts */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--outline)] mb-3 flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Quick Prompts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => handleQuickPrompt(qp.instruction)}
                      disabled={isRefining}
                      className="px-3.5 py-2 rounded-full border border-[var(--outline-variant)] text-sm text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-fixed)]/5 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <qp.icon size={14} className="text-[var(--primary)] shrink-0"/>
                      {qp.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* 指令输入 */}
              <section>
                <label className="text-sm font-medium" htmlFor="refine-instruction">
                  What would you like to change?
                </label>
                <div className="mt-2 flex flex-col border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-bright)] focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all overflow-hidden">
                  <textarea
                    id="refine-instruction"
                    className="w-full border-none bg-transparent p-4 text-sm placeholder:text-[var(--outline)] resize-none focus:ring-0"
                    placeholder='e.g. "Make it more casual", "Shorten to 100 words", "Add a question at the end"'
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    disabled={isRefining}
                    rows={3}
                  />
                </div>
              </section>
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 border-t border-[var(--outline-variant)]/50 bg-[var(--surface-container-lowest)] space-y-3">
          {error && (
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
              <p className="mb-2">{error}</p>
              {error.includes("Upgrade to Pro") && (
                <button
                  type="button"
                  onClick={() => {
                    cancelRefine();
                    setError(null);
                    window.location.href = "/#pricing";
                  }}
                  className="inline-block rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs px-4 py-1.5 transition-all"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}
          <div className="flex gap-3">
            {preRefineContent ? (
              <Button
                onClick={cancelRefine}
                className="flex-1 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] glow-purple-sm"
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={cancelRefine}
                  disabled={isRefining}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefine}
                  disabled={!refineInstruction.trim() || isRefining}
                  className="flex-1 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] glow-purple-sm"
                >
                  {isRefining ? (
                    <>
                      <Spinner className="mr-2" />
                      Refining...
                    </>
                  ) : (
                    "Apply"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
