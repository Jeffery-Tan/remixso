"use client";

import { useState, useEffect } from "react";
import { useGenerationStore } from "@/store/generation-store";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Dialog } from "@/components/ui/Dialog";
import { ContentInput } from "./ContentInput";
import { PlatformPicker } from "./PlatformPicker";
import { GenerationProgress } from "./GenerationProgress";
import { ResultsPanel } from "./ResultsPanel";
import { RefineDrawer } from "./RefineDrawer";
import { ExportBar } from "./ExportBar";
import { CreditBadge, TrialBanner } from "./CreditBadge";

// Dashboard 工作区主容器

export function Workspace() {
  const {
    sourceContent,
    selectedPlatforms,
    status,
    error,
    generate,
    reset,
    results,
    refiningPlatform,
    setSourceContent,
  } = useGenerationStore();

  const { credits } = useAuth();
  const isPro = credits?.isSubscribed ?? false;

  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(
    "Paste your article, blog post, or any long-form content here..."
  );

  // 从首页内联试用区传入的草稿文本
  useEffect(() => {
    const draft = sessionStorage.getItem("remixso_draft");
    if (draft) {
      setSourceContent(draft);
      sessionStorage.removeItem("remixso_draft");
    }
  }, [setSourceContent]);

  const canGenerate =
    sourceContent.trim().length > 0 && selectedPlatforms.length > 0;
  const isProcessing = status !== "idle" && status !== "error" && status !== "done";
  const hasResults = status === "done" && Object.keys(results).length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    if (!isPro && sourceContent.length > 5000) {
      setShowLimitWarning(true);
      return;
    }
    generate();
  };

  const handleGenerateAnyway = () => {
    setShowLimitWarning(false);
    setSourceContent(sourceContent.slice(0, 5000));
    generate();
  };

  const handleNew = () => {
    setShowNewConfirm(true);
  };

  const confirmNew = () => {
    reset();
    setShowNewConfirm(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-4 sm:space-y-6">
      {/* 顶部：积分 + 试用提示 */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-headline)] text-xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <CreditBadge />
      </div>
      <TrialBanner />

      {/* 空白状态引导 */}
      {status === "idle" && !sourceContent && (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-[var(--surface-container)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--on-surface-variant)]">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold mb-1">
            Ready to remix your content?
          </h2>
          <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Paste your long-form text or a blog URL, pick your platforms, and
            let AI do the rest.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["article", "blog post", "newsletter", "essay"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setDynamicPlaceholder(`Paste your ${type} here to get started...`)
                }
                className="px-3.5 py-2 text-xs rounded-full border border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-fixed)]/5 transition-all"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区 */}
      <section className="space-y-4">
        <ContentInput placeholder={dynamicPlaceholder} />

        <PlatformPicker />

        {/* 错误信息 */}
        {status === "error" && error && (
          <div role="alert" className="p-3 rounded-lg border border-[var(--destructive)]/20 bg-[var(--error-container)] text-sm text-[var(--on-error-container)]">
            {error}
            <button
              onClick={() => generate()}
              className="ml-3 underline text-[var(--on-error-container)]/80 hover:text-[var(--on-error-container)]"
            >
              Retry
            </button>
          </div>
        )}

        {/* 生成 / 重新生成按钮 */}
        <div className="flex gap-2">
          {hasResults ? (
            <>
              <Button onClick={handleNew} variant="outline">
                New
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] glow-purple-sm"
              >
                Regenerate
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isProcessing}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-semibold tracking-wider uppercase text-sm glow-purple-sm hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Spinner className="mr-2" />
                  {status === "analyzing"
                    ? "Analyzing tone..."
                    : "Generating..."}
                </>
              ) : (
                <>
                  Generate
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* 进度指示 */}
      <GenerationProgress />

      {/* 导出栏 */}
      {hasResults && <ExportBar />}

      {/* 结果区 */}
      <section>
        <ResultsPanel />
      </section>

      {/* 微调抽屉 */}
      <RefineDrawer />

      {/* 字符超限警告弹窗 */}
      <Dialog
        open={showLimitWarning}
        onOpenChange={setShowLimitWarning}
        title="Content exceeds free limit"
        description={`Free plan supports up to 5,000 characters. Your content is ${sourceContent.length.toLocaleString()} characters. Upgrade to Pro for 15,000 characters, or generate with the first 5,000 characters only.`}
      >
        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => setShowLimitWarning(false)}
          >
            Cancel
          </Button>
          <Button variant="outline" onClick={handleGenerateAnyway}>
            Generate anyway (5K)
          </Button>
          <Button
            onClick={() => {
              setShowLimitWarning(false);
              window.location.href = "/#pricing";
            }}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
          >
            Upgrade to Pro
          </Button>
        </div>
      </Dialog>

      {/* New 确认弹窗 */}
      <Dialog
        open={showNewConfirm}
        onOpenChange={setShowNewConfirm}
        title="Discard results?"
        description="This will clear all generated content. This action cannot be undone."
      >
        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => setShowNewConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmNew}
            className="bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-[var(--destructive-foreground)]"
          >
            Discard
          </Button>
        </div>
      </Dialog>

    </div>
  );
}
