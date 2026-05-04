"use client";

import { create } from "zustand";
import type { PlatformCode } from "@/types/platform";
import type { GenerationStatus, PlatformResult, HistoryEntry } from "@/types/generation";
import { useHistoryStore } from "@/store/history-store";

// 单平台生成进度
type PlatformGenStatus = "pending" | "generating" | "done" | "error";

// 生成流程状态机

interface GenerationState {
  // 输入
  sourceType: "text" | "url";
  sourceContent: string;
  sourceTitle: string | null;
  sourceUrl: string;

  // 平台选择
  selectedPlatforms: PlatformCode[];

  // 生成状态
  status: GenerationStatus;
  generationId: string | null;
  toneProfile: Record<string, unknown> | null;
  results: Partial<Record<PlatformCode, PlatformResult>>;
  platformErrors: Partial<Record<string, string>>;
  platformStatuses: Partial<Record<PlatformCode, PlatformGenStatus>>;
  creditsRemaining: number | null;
  error: string | null;

  // 微调
  refiningPlatform: PlatformCode | null;
  refineInstruction: string;
  isRefining: boolean;

  // Actions
  setSourceType: (type: "text" | "url") => void;
  setSourceContent: (content: string) => void;
  setSourceTitle: (title: string | null) => void;
  setSourceUrl: (url: string) => void;
  togglePlatform: (platform: PlatformCode) => void;
  setError: (error: string | null) => void;
  generate: (sessionId?: string) => Promise<void>;
  startRefine: (platform: PlatformCode) => void;
  cancelRefine: () => void;
  setRefineInstruction: (instruction: string) => void;
  refine: (platform: PlatformCode) => Promise<void>;
  retryPlatform: (platform: PlatformCode) => Promise<void>;
  updateResultContent: (platform: PlatformCode, content: string) => void;
  reset: () => void;
  setCreditsRemaining: (credits: number | null) => void;
  setSelectedPlatforms: (platforms: PlatformCode[]) => void;
  loadHistoryEntry: (entry: HistoryEntry) => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  sourceType: "text",
  sourceContent: "",
  sourceTitle: null,
  sourceUrl: "",

  selectedPlatforms: ["twitter", "linkedin"],

  status: "idle",
  generationId: null,
  toneProfile: null,
  results: {},
  platformErrors: {},
  platformStatuses: {},
  creditsRemaining: null,
  error: null,

  refiningPlatform: null,
  refineInstruction: "",
  isRefining: false,

  setSourceType: (type) => set({ sourceType: type }),
  setSourceContent: (content) => set({ sourceContent: content }),
  setSourceTitle: (title) => set({ sourceTitle: title }),
  setSourceUrl: (url) => set({ sourceUrl: url }),
  setError: (error) => set({ error }),

  togglePlatform: (platform) => {
    const { selectedPlatforms } = get();
    if (selectedPlatforms.includes(platform)) {
      set({
        selectedPlatforms: selectedPlatforms.filter((p) => p !== platform),
      });
    } else {
      set({ selectedPlatforms: [...selectedPlatforms, platform] });
    }
  },

  generate: async (sessionId) => {
    const { sourceContent, selectedPlatforms, sourceType, sourceTitle } = get();

    if (!sourceContent.trim() || selectedPlatforms.length === 0) return;

    // 所有平台标记为 pending
    const initStatuses: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
    for (const p of selectedPlatforms) initStatuses[p] = "pending";

    set({
      status: "analyzing",
      error: null,
      results: {},
      platformErrors: {},
      platformStatuses: initStatuses,
      toneProfile: null,
    });

    // 2 秒后语气分析"完成"，各平台进入生成中
    const genTimer = setTimeout(() => {
      const generating: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
      for (const p of selectedPlatforms) generating[p] = "generating";
      set({ status: "generating", platformStatuses: generating });
    }, 2000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceContent: sourceContent.trim(),
          platforms: selectedPlatforms,
          sessionId,
          sourceTitle: sourceTitle ?? undefined,
        }),
      });

      clearTimeout(genTimer);

      if (!res.ok) {
        const data = await res.json();
        const failedStatuses: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
        for (const p of selectedPlatforms) failedStatuses[p] = "error";
        if (res.status === 402) {
          set({ status: "error", error: data.error, creditsRemaining: 0, platformStatuses: failedStatuses });
        } else {
          set({ status: "error", error: data.error || "Generation failed", platformStatuses: failedStatuses });
        }
        return;
      }

      const data = await res.json();

      // 将 API 返回的 results 转为 PlatformResult 格式
      const results: Partial<Record<PlatformCode, PlatformResult>> = {};
      for (const [key, value] of Object.entries(data.results) as [
        string,
        { content: string; charCount: number; isEdited: boolean }
      ][]) {
        results[key as PlatformCode] = {
          content: value.content,
          charCount: value.charCount,
          isEdited: value.isEdited,
        };
      }

      // 构建平台状态：按 API 结果区分 done / error
      const platformStatuses: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
      for (const p of selectedPlatforms) {
        platformStatuses[p] = results[p] ? "done" : "error";
      }

      set({
        status: "done",
        generationId: data.generationId,
        results,
        platformErrors: data.errors ?? {},
        platformStatuses,
        creditsRemaining: data.creditsRemaining ?? null,
      });
    } catch {
      clearTimeout(genTimer);
      const failedStatuses: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
      for (const p of selectedPlatforms) failedStatuses[p] = "error";
      set({ status: "error", error: "Network error. Please try again.", platformStatuses: failedStatuses });
    }
  },

  startRefine: (platform) =>
    set({ refiningPlatform: platform, refineInstruction: "" }),

  cancelRefine: () =>
    set({ refiningPlatform: null, refineInstruction: "" }),

  setRefineInstruction: (instruction) => set({ refineInstruction: instruction }),

  refine: async (platform) => {
    const { refineInstruction, results, generationId } = get();
    const current = results[platform];
    if (!current || !refineInstruction.trim()) return;

    set({ isRefining: true, error: null });
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId,
          platform,
          instruction: refineInstruction.trim(),
          originalContent: current.content,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        set({
          error:
            data.code === "UPGRADE_REQUIRED"
              ? data.error
              : "Refinement failed",
          isRefining: false,
        });
        return;
      }

      const data = await res.json();
      set({
        results: {
          ...get().results,
          [platform]: {
            content: data.content,
            charCount: data.charCount,
            isEdited: true,
          },
        },
        refiningPlatform: null,
        refineInstruction: "",
        isRefining: false,
        creditsRemaining: data.creditsRemaining ?? get().creditsRemaining,
      });

      // 同步更新历史记录
      if (generationId) {
        useHistoryStore
          .getState()
          .updateEntryOutput(generationId, platform, data.content);
      }
    } catch {
      set({ error: "Network error during refinement.", isRefining: false });
    }
  },

  retryPlatform: async (platform) => {
    const { generationId, sourceContent, sourceTitle, platformErrors } = get();
    if (!generationId) return;

    // 清除旧错误，标记生成中
    const nextErrors = { ...platformErrors };
    delete nextErrors[platform];
    set({
      platformErrors: nextErrors,
      error: null,
      platformStatuses: { ...get().platformStatuses, [platform]: "generating" },
    });

    try {
      const res = await fetch("/api/retry-platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, platform, sourceContent, sourceTitle }),
      });

      if (!res.ok) {
        const data = await res.json();
        set({
          platformErrors: { ...get().platformErrors, [platform]: data.error || "Retry failed" },
          platformStatuses: { ...get().platformStatuses, [platform]: "error" },
        });
        return;
      }

      const data = await res.json();
      set({
        results: { ...get().results, [platform]: { content: data.content, charCount: data.charCount, isEdited: false } },
        platformStatuses: { ...get().platformStatuses, [platform]: "done" },
      });
    } catch {
      set({
        platformErrors: { ...get().platformErrors, [platform]: "Network error during retry" },
        platformStatuses: { ...get().platformStatuses, [platform]: "error" },
      });
    }
  },

  updateResultContent: (platform, content) => {
    const current = get().results[platform];
    if (!current) return;
    set({
      results: {
        ...get().results,
        [platform]: { ...current, content, isEdited: true },
      },
    });
  },

  reset: () =>
    set({
      status: "idle",
      generationId: null,
      toneProfile: null,
      results: {},
      error: null,
      platformErrors: {},
      platformStatuses: {},
      refiningPlatform: null,
      refineInstruction: "",
      sourceContent: "",
      sourceTitle: null,
      sourceUrl: "",
    }),

  setCreditsRemaining: (credits) => set({ creditsRemaining: credits }),

  setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),

  loadHistoryEntry: (entry) => {
    const outputs: Partial<Record<PlatformCode, PlatformResult>> = {};
    const platformStatuses: Partial<Record<PlatformCode, PlatformGenStatus>> = {};
    for (const o of entry.outputs) {
      outputs[o.platform as PlatformCode] = {
        content: o.content,
        charCount: o.content.length,
        isEdited: false,
      };
      platformStatuses[o.platform as PlatformCode] = "done";
    }
    set({
      sourceType: entry.sourceType,
      sourceContent: entry.sourceContent,
      sourceTitle: entry.sourceTitle,
      sourceUrl: entry.sourceUrl ?? "",
      selectedPlatforms: entry.platforms,
      status: "done",
      generationId: entry.id,
      results: outputs,
      error: null,
      platformErrors: {},
      platformStatuses,
      refiningPlatform: null,
      refineInstruction: "",
    });
  },
}));
