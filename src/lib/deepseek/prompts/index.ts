// 平台 prompt 统一导出 + getPlatformPrompt() 映射表（供 pipeline 使用）

export { TONE_ANALYZER_PROMPT } from "./tone-analyzer";

// 直接用各平台独立文件的详细 prompt，不重复定义
import { TWITTER_PROMPT, buildTwitterUserMessage } from "./twitter";
import {
  LINKEDIN_PROMPT,
  buildLinkedInUserMessage,
} from "./linkedin";
import {
  INSTAGRAM_PROMPT,
  buildInstagramUserMessage,
} from "./instagram";
import {
  NEWSLETTER_PROMPT,
  buildNewsletterUserMessage,
} from "./newsletter";
import {
  TIKTOK_PROMPT,
  buildTikTokUserMessage,
} from "./tiktok";
import {
  YOUTUBE_SHORTS_PROMPT,
  buildYouTubeShortsUserMessage,
} from "./youtube-shorts";

export {
  TWITTER_PROMPT,
  buildTwitterUserMessage,
  LINKEDIN_PROMPT,
  buildLinkedInUserMessage,
  INSTAGRAM_PROMPT,
  buildInstagramUserMessage,
  NEWSLETTER_PROMPT,
  buildNewsletterUserMessage,
  TIKTOK_PROMPT,
  buildTikTokUserMessage,
  YOUTUBE_SHORTS_PROMPT,
  buildYouTubeShortsUserMessage,
};

import type { PlatformCode } from "@/types/platform";

const platformConfig: Record<
  PlatformCode,
  {
    system: string;
    buildUserMessage: (
      toneProfile: Record<string, unknown>,
      content: string,
      title?: string
    ) => string;
  }
> = {
  twitter: {
    system: TWITTER_PROMPT,
    buildUserMessage: buildTwitterUserMessage,
  },
  linkedin: {
    system: LINKEDIN_PROMPT,
    buildUserMessage: buildLinkedInUserMessage,
  },
  instagram: {
    system: INSTAGRAM_PROMPT,
    buildUserMessage: buildInstagramUserMessage,
  },
  newsletter: {
    system: NEWSLETTER_PROMPT,
    buildUserMessage: buildNewsletterUserMessage,
  },
  tiktok: {
    system: TIKTOK_PROMPT,
    buildUserMessage: buildTikTokUserMessage,
  },
  "youtube-shorts": {
    system: YOUTUBE_SHORTS_PROMPT,
    buildUserMessage: buildYouTubeShortsUserMessage,
  },
};

export function getPlatformPrompt(platform: PlatformCode) {
  return platformConfig[platform];
}
