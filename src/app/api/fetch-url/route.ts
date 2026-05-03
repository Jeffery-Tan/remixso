import { NextRequest, NextResponse } from "next/server";
import { fetchUrlContent } from "@/lib/content/fetcher";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/fetch-url —— URL 抓取 + 正文提取
// 限流：每 IP 每分钟 10 次

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function POST(request: NextRequest) {
  try {
    // 限流
    const ip = getClientIP(request);
    const rate = checkRateLimit(ip, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const result = await fetchUrlContent(url);

    return NextResponse.json({
      title: result.title,
      content: result.content,
      charCount: result.content.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "URL fetch failed";
    console.error("/api/fetch-url error:", err);
    return NextResponse.json(
      { error: message, code: "URL_FETCH_FAILED" },
      { status: 500 }
    );
  }
}
