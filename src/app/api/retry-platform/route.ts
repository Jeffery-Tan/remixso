import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPlatformPrompt } from "@/lib/deepseek/prompts";
import { chatCompletion } from "@/lib/deepseek/client";
import type { PlatformCode } from "@/types/platform";

const VALID_PLATFORMS: PlatformCode[] = [
  "twitter", "linkedin", "instagram", "newsletter", "tiktok", "youtube-shorts",
];

// POST /api/retry-platform —— 仅重新生成单个平台，不扣积分
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, platform, sourceContent, sourceTitle } = body;

    if (!generationId || !platform || !sourceContent) {
      return NextResponse.json(
        { error: "generationId, platform, and sourceContent are required" },
        { status: 400 }
      );
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: `Invalid platform: ${platform}` }, { status: 400 });
    }

    // 用 service client 读取已存储的 tone profile
    const serviceClient = createServiceClient();
    const { data: generation } = await serviceClient
      .from("generations")
      .select("tone_profile")
      .eq("id", generationId)
      .single();

    const toneProfile = generation?.tone_profile ?? {
      voice: "neutral and informative",
      pacing: "moderate",
      sentence_structure: "mixed",
      vocabulary_level: "everyday",
      signature_phrases: [],
      pronouns: "you/your",
      formality_index: 5,
      tone_adjectives: ["neutral", "informative"],
    };

    // 重新生成该平台
    const prompt = getPlatformPrompt(platform as PlatformCode);
    if (!prompt) {
      return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
    }

    const content = await chatCompletion([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.buildUserMessage(toneProfile, sourceContent, sourceTitle) },
    ], { timeoutMs: 30_000 });

    // 保存新输出（替换旧记录或插入）
    const { data: existing } = await serviceClient
      .from("platform_outputs")
      .select("id")
      .eq("generation_id", generationId)
      .eq("platform", platform)
      .maybeSingle();

    if (existing) {
      await serviceClient
        .from("platform_outputs")
        .update({ generated_content: content })
        .eq("id", existing.id);
    } else {
      await serviceClient
        .from("platform_outputs")
        .insert({ generation_id: generationId, platform, generated_content: content });
    }

    return NextResponse.json({
      platform,
      content,
      charCount: content.length,
      isEdited: false,
    });
  } catch (err) {
    console.error("/api/retry-platform error:", err);
    return NextResponse.json(
      { error: "Platform retry failed. Please try again." },
      { status: 500 }
    );
  }
}
