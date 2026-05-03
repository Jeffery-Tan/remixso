import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/deepseek/pipeline";
import { checkAndDeductCredit } from "@/lib/credit-manager";
import { checkRateLimit } from "@/lib/rate-limit";
import type { GenerateRequest } from "@/types/generation";
import type { PlatformCode } from "@/types/platform";

// POST /api/generate —— 主生成端点
// 匿名用户可用（有限额），登录用户根据订阅状态扣除积分

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
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { sourceType, sourceContent, platforms, sessionId, sourceTitle } = body;

    // 输入验证
    if (!sourceContent || typeof sourceContent !== "string") {
      return NextResponse.json(
        { error: "Content is required", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const FREE_CHAR_LIMIT = 5000;
    const PRO_CHAR_LIMIT = 15000;

    // 超过 Pro 上限直接拒绝，无需查询用户
    if (sourceContent.length > PRO_CHAR_LIMIT) {
      return NextResponse.json(
        {
          error: `Content exceeds ${PRO_CHAR_LIMIT.toLocaleString()} character limit`,
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    // 获取用户身份（仅在超过免费限额时才需要查订阅状态）
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isPro = false;
    if (user && sourceContent.length > FREE_CHAR_LIMIT) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single();
      isPro =
        subscription?.status === "active" ||
        subscription?.status === "trialing";
    }

    // 字符上限：Pro 用户 15000，其余 5000
    const maxChars = isPro ? PRO_CHAR_LIMIT : FREE_CHAR_LIMIT;
    if (sourceContent.length > maxChars) {
      return NextResponse.json(
        {
          error: `Content exceeds ${maxChars.toLocaleString()} character limit. ${
            !user
              ? "Sign up for Pro to unlock 15,000 characters."
              : "Upgrade to Pro for 15,000 characters."
          }`,
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform is required", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const validPlatforms: PlatformCode[] = [
      "twitter",
      "linkedin",
      "instagram",
      "newsletter",
      "tiktok",
      "youtube-shorts",
    ];
    for (const p of platforms) {
      if (!validPlatforms.includes(p)) {
        return NextResponse.json(
          { error: `Invalid platform: ${p}`, code: "INVALID_INPUT" },
          { status: 400 }
        );
      }
    }

    // 积分检查（原子递减）
    const creditCheck = await checkAndDeductCredit(
      user?.id ?? null,
      sessionId ?? null
    );

    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: "No free generations remaining. Sign up or upgrade to continue.",
          code: "CREDITS_EXHAUSTED",
        },
        { status: 402 }
      );
    }

    // 执行 AI Pipeline
    const result = await runPipeline(sourceContent, platforms, sourceTitle ?? undefined);

    // 保存生成记录到数据库
    const { data: generation } = await supabase
      .from("generations")
      .insert({
        user_id: user?.id ?? null,
        anonymous_session_id: !user?.id ? (sessionId ?? null) : null,
        source_type: sourceType,
        source_content: sourceContent,
        platforms: platforms,
        tone_profile: result.toneProfile,
        total_tokens_used: result.totalTokens,
        processing_ms: result.processingMs,
      })
      .select("id")
      .single();

    // 保存各平台输出（用 service client 绕过 RLS，避免因缺少 INSERT policy 写入失败）
    if (generation) {
      const outputs = Object.entries(result.platforms)
        .filter(([, content]) => content)
        .map(([platform, content]) => ({
          generation_id: generation.id,
          platform,
          generated_content: content,
        }));

      if (outputs.length > 0) {
        const serviceClient = createServiceClient();
        const { error: outputsError } = await serviceClient
          .from("platform_outputs")
          .insert(outputs);
        if (outputsError) {
          console.error("Failed to save platform outputs:", outputsError);
        }
      }
    }

    // 返回结果
    const results: Record<string, { content: string; charCount: number; isEdited: boolean }> = {};
    for (const [platform, content] of Object.entries(result.platforms)) {
      if (content) {
        results[platform] = {
          content,
          charCount: content.length,
          isEdited: false,
        };
      }
    }

    return NextResponse.json({
      generationId: generation?.id ?? "unknown",
      results,
      creditsRemaining: creditCheck.remaining,
      errors: result.errors,
    });
  } catch (err) {
    console.error("/api/generate error:", err);
    return NextResponse.json(
      {
        error: "AI generation failed. Please try again.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 500 }
    );
  }
}
