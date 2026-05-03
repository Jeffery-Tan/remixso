import OpenAI from "openai";

// DeepSeek API 客户端（兼容 OpenAI SDK 格式）
// 仅在服务端使用，密钥不暴露给浏览器

let client: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

// 通用聊天补全封装
export async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
    timeoutMs?: number;
  }
): Promise<string> {
  const deepseek = getDeepSeekClient();

  const response = await deepseek.chat.completions.create(
    {
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: options?.responseFormat
        ? { type: options.responseFormat }
        : undefined,
    },
    options?.timeoutMs
      ? { timeout: options.timeoutMs }
      : undefined
  );

  return response.choices[0]?.message?.content ?? "";
}
