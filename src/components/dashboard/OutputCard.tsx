"use client";

import { useGenerationStore } from "@/store/generation-store";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// 单平台结果卡片 —— 展示内容 + 复制/微调按钮

interface OutputCardProps {
  platform: string;
  content: string;
  charCount: number;
  isEdited: boolean;
}

export function OutputCard({
  platform,
  content,
  charCount,
  isEdited,
}: OutputCardProps) {
  const { startRefine } = useGenerationStore();
  const { addToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  return (
    <div className="rounded-xl border border-[var(--outline-variant)]/50 overflow-hidden bg-[var(--surface-container-lowest)]">
      {/* 内容区 */}
      <div className="p-5 whitespace-pre-wrap text-sm leading-relaxed min-h-[100px] max-h-[200px] overflow-y-auto">
        {content}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]/50">
        <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
          <span>{charCount} chars</span>
          {isEdited && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-medium">
              edited
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-xs h-7"
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startRefine(platform as never)}
            className="text-xs h-7"
          >
            Refine
          </Button>
        </div>
      </div>

      {/* AI disclosure */}
      <div className="px-4 py-2 border-t border-[var(--outline-variant)]/20 bg-amber-50/50 dark:bg-amber-900/20">
        <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
          AI-generated content. Please label as AI-generated before posting, per
          each platform&apos;s requirements (e.g. LinkedIn AI label, Instagram AI
          tag).
        </p>
      </div>
    </div>
  );
}
