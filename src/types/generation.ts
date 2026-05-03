import type { PlatformCode } from "./platform";

// 生成状态枚举
export type GenerationStatus =
  | "idle"
  | "analyzing"
  | "generating"
  | "done"
  | "error";

// 单平台生成结果
export interface PlatformResult {
  content: string;
  charCount: number;
  isEdited: boolean;
}

// 输入来源类型
export type SourceType = "text" | "url";

// 生成请求
export interface GenerateRequest {
  sourceType: SourceType;
  sourceContent: string;
  platforms: PlatformCode[];
  sessionId?: string;
  sourceTitle?: string;
}

// 生成响应
export interface GenerateResponse {
  generationId: string;
  results: Record<PlatformCode, PlatformResult>;
  creditsRemaining: number | null;
}

// 微调请求
export interface RefineRequest {
  generationId: string;
  platform: PlatformCode;
  instruction: string;
  originalContent: string;
}

// URL抓取响应
export interface FetchUrlResponse {
  title: string;
  content: string;
  charCount: number;
}

// 历史记录条目
export interface HistoryEntry {
  id: string;
  sourceType: SourceType;
  sourceContent: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  platforms: PlatformCode[];
  totalTokensUsed: number;
  processingMs: number | null;
  createdAt: string;
  outputs: { platform: PlatformCode; content: string }[];
}
