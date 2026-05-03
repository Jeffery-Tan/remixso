import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 截断字符串到指定字符数
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// 统计字符数（正确处理emoji）
export function countChars(str: string): number {
  return [...str].length;
}

// 生成确定性幂等键
export async function generateIdempotencyKey(
  userId: string | null,
  content: string,
  platforms: string[]
): Promise<string> {
  const data = `${userId ?? "anon"}:${content}:${platforms.sort().join(",")}`;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
