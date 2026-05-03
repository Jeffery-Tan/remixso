import { chatCompletion } from "./client";
import { TONE_ANALYZER_PROMPT, getPlatformPrompt } from "./prompts";
import type { PlatformCode } from "@/types/platform";

// Pipeline 超时配置
const TONE_ANALYSIS_TIMEOUT_MS = 20_000; // 语气分析单次 20 秒
const PLATFORM_GEN_TIMEOUT_MS = 30_000;  // 单平台生成 30 秒

// 流水线结果
export interface PipelineResult {
  toneProfile: Record<string, unknown>;
  platforms: Partial<Record<PlatformCode, string>>;
  totalTokens: number;
  processingMs: number;
  errors: Partial<Record<PlatformCode, string>>;
}

// 语气分析 —— 第一步，分析原文的表达特征
async function analyzeTone(content: string, title?: string): Promise<Record<string, unknown>> {
  const input = `${content}${title ? `\n\nTitle: ${title}` : ""}`;

  const response = await chatCompletion(
    [
      { role: "system", content: TONE_ANALYZER_PROMPT },
      { role: "user", content: input },
    ],
    { temperature: 0.3, responseFormat: "json_object", timeoutMs: TONE_ANALYSIS_TIMEOUT_MS }
  );

  try {
    return JSON.parse(response);
  } catch {
    // 如果模型没返回纯 JSON，尝试提取
    const match = response.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Tone analysis returned invalid JSON");
  }
}

// 单平台生成 —— 第二步，针对每个平台并行生成
async function generateForPlatform(
  platform: PlatformCode,
  toneProfile: Record<string, unknown>,
  sourceContent: string,
  sourceTitle?: string
): Promise<string> {
  const prompt = getPlatformPrompt(platform);
  if (!prompt) throw new Error(`Unknown platform: ${platform}`);

  return chatCompletion([
    { role: "system", content: prompt.system },
    {
      role: "user",
      content: prompt.buildUserMessage(toneProfile, sourceContent, sourceTitle),
    },
  ], { timeoutMs: PLATFORM_GEN_TIMEOUT_MS });
}

// 主流水线入口
// 步骤 1：分析语气 → 步骤 2：并行生成各平台内容 → 组装结果
export async function runPipeline(
  sourceContent: string,
  platforms: PlatformCode[],
  sourceTitle?: string
): Promise<PipelineResult> {
  const startedAt = Date.now();
  let totalTokens = 0;
  const errors: Partial<Record<PlatformCode, string>> = {};

  // 第 1 层：语气分析
  let toneProfile: Record<string, unknown>;
  try {
    toneProfile = await analyzeTone(sourceContent, sourceTitle);
  } catch (err) {
    toneProfile = {
      voice: "neutral and informative",
      pacing: "moderate",
      sentence_structure: "mixed",
      vocabulary_level: "everyday",
      signature_phrases: [],
      pronouns: "you/your",
      formality_index: 5,
      tone_adjectives: ["neutral", "informative"],
    };
  }

  // 第 2 层：并行平台生成（每个平台自己处理错误，确保返回平台名）
  const platformResults = await Promise.allSettled(
    platforms.map(async (platform) => {
      try {
        const content = await generateForPlatform(
          platform,
          toneProfile,
          sourceContent,
          sourceTitle
        );
        return { platform, content, error: null };
      } catch (err) {
        return {
          platform,
          content: null,
          error: err instanceof Error ? err.message : "Generation failed",
        };
      }
    })
  );

  const outputs: Partial<Record<PlatformCode, string>> = {};
  for (const result of platformResults) {
    if (result.status === "fulfilled") {
      if (result.value.error) {
        errors[result.value.platform] = result.value.error;
      } else if (result.value.content) {
        outputs[result.value.platform] = result.value.content;
      }
    }
  }

  return {
    toneProfile,
    platforms: outputs,
    totalTokens,
    processingMs: Date.now() - startedAt,
    errors,
  };
}
