"use client";

import { create } from "zustand";
import type { HistoryEntry } from "@/types/generation";

// 历史记录状态管理

interface HistoryState {
  entries: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntryOutput: (
    generationId: string,
    platform: string,
    newContent: string
  ) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({ entries: data.entries, isLoading: false });
    } catch {
      set({ error: "Failed to load history", isLoading: false });
    }
  },

  deleteEntry: async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      set({ entries: get().entries.filter((e) => e.id !== id) });
    } catch {
      set({ error: "Failed to delete" });
    }
  },

  updateEntryOutput: (generationId, platform, newContent) => {
    set({
      entries: get().entries.map((e) => {
        if (e.id !== generationId) return e;
        return {
          ...e,
          outputs: e.outputs.map((o) =>
            o.platform === platform ? { ...o, content: newContent } : o
          ),
        };
      }),
    });
  },
}));
