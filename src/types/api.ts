// API 统一错误响应
export interface ApiError {
  error: string;
  code: ErrorCode;
  retryAfter?: number;
}

export type ErrorCode =
  | "CREDITS_EXHAUSTED"
  | "RATE_LIMITED"
  | "INVALID_INPUT"
  | "URL_FETCH_FAILED"
  | "AI_GENERATION_FAILED"
  | "UNAUTHORIZED";
