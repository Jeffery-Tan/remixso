"use client";

import { useGenerationStore } from "@/store/generation-store";
import { Button } from "@/components/ui/Button";
import { PLATFORM_META } from "@/types/platform";
import type { PlatformCode } from "@/types/platform";
import { useToast } from "@/components/ui/Toast";

// 批量导出栏：复制全部 / JSON / Markdown

export function ExportBar() {
  const { results, status } = useGenerationStore();
  const { addToast } = useToast();

  if (status !== "done") return null;

  const platformsWithResults = Object.entries(results).filter(
    ([, v]) => v
  ) as [string, { content: string }][];

  if (platformsWithResults.length === 0) return null;

  const copyAll = async () => {
    try {
      const text = platformsWithResults
        .map(([platform, result]) => {
          const meta = PLATFORM_META[platform as PlatformCode];
          return `${meta.label}\n${"─".repeat(meta.label.length)}\n${result.content}`;
        })
        .join("\n\n---\n\n");

      await navigator.clipboard.writeText(text);
      addToast("All results copied", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const downloadJSON = () => {
    const json = JSON.stringify(
      Object.fromEntries(
        platformsWithResults.map(([p, r]) => [p, r.content])
      ),
      null,
      2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "remixso-results.json";
    a.click();
    URL.revokeObjectURL(url);
    addToast("JSON downloaded", "success");
  };

  const downloadMarkdown = () => {
    const md = platformsWithResults
      .map(([platform, result]) => {
        const meta = PLATFORM_META[platform as PlatformCode];
        return `## ${meta.label}\n\n${result.content}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "remixso-results.md";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Markdown downloaded", "success");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[var(--muted-foreground)] mr-1">Export:</span>
      <Button variant="outline" size="sm" onClick={copyAll}>
        Copy all
      </Button>
      <Button variant="outline" size="sm" onClick={downloadMarkdown}>
        Markdown
      </Button>
      <Button variant="outline" size="sm" onClick={downloadJSON}>
        JSON
      </Button>
    </div>
  );
}
