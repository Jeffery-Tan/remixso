import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/deepseek/client";
import { checkRateLimit } from "@/lib/rate-limit";
import type { PlatformCode } from "@/types/platform";

// POST /api/refine —— 单平台微调重新生成，结果持久化到 platform_outputs

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
    const rate = checkRateLimit(ip, 10); // 微调调用更宽松：每分钟 10 次
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // 认证
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isPro = false;
    if (user) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single();

      isPro =
        subscription?.status === "active" ||
        subscription?.status === "trialing";
    }

    const body = await request.json();
    const { generationId, platform, instruction, originalContent } = body;

    if (!instruction || !originalContent) {
      return NextResponse.json(
        { error: "Instruction and original content are required", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    // 免费用户：每个生成结果只能 refine 一次，Pro 无限
    if (generationId && !isPro) {
      const serviceClient = createServiceClient();
      const { data: refined } = await serviceClient
        .from("platform_outputs")
        .select("created_at, updated_at")
        .eq("generation_id", generationId);

      const hasBeenRefined = refined?.some((o) => {
        const created = new Date(o.created_at).getTime();
        const updated = new Date(o.updated_at).getTime();
        return updated - created > 2000; // 2 秒容差，排除初始插入延迟
      });

      if (hasBeenRefined) {
        return NextResponse.json(
          {
            error: "Free users can refine each generation once. Upgrade to Pro for unlimited refinements.",
            code: "UPGRADE_REQUIRED",
          },
          { status: 402 }
        );
      }
    }

    const response = await chatCompletion([
      {
        role: "system",
        content: `You are a precise text editor. Apply the user's requested change to the content below. Return ONLY the revised version — no explanations, no meta-commentary.`,
      },
      {
        role: "user",
        content: `ORIGINAL CONTENT:\n${originalContent}\n\nINSTRUCTION:\n${instruction}`,
      },
    ]);

    // 持久化微调结果（用 service client 绕过 RLS）
    if (generationId) {
      const serviceClient = createServiceClient();
      const { error: upsertError } = await serviceClient
        .from("platform_outputs")
        .upsert(
          {
            generation_id: generationId,
            platform,
            generated_content: response,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "generation_id, platform" }
        );

      if (upsertError) {
        console.error("Failed to persist refine:", upsertError);
      }
    }

    return NextResponse.json({
      platform,
      content: response,
      charCount: response.length,
    });
  } catch (err) {
    console.error("/api/refine error:", err);
    return NextResponse.json(
      { error: "Refinement failed", code: "AI_GENERATION_FAILED" },
      { status: 500 }
    );
  }
}
