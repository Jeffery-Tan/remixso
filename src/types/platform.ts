// 支持的平台枚举
export const PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "newsletter",
  "tiktok",
  "youtube-shorts",
] as const;

export type PlatformCode = (typeof PLATFORMS)[number];

// 每个平台的元数据
export interface PlatformMeta {
  code: PlatformCode;
  label: string;
  shortLabel: string;
  icon: string;
  charLimit: number;
  description: string;
}

export const PLATFORM_META: Record<PlatformCode, PlatformMeta> = {
  twitter: {
    code: "twitter",
    label: "X / Twitter Thread",
    shortLabel: "X",
    icon: "Twitter",
    charLimit: 280,
    description: "5-12 tweet thread with hook and CTA",
  },
  linkedin: {
    code: "linkedin",
    label: "LinkedIn Post",
    shortLabel: "LinkedIn",
    icon: "Linkedin",
    charLimit: 3000,
    description: "800-1,200 char professional post",
  },
  instagram: {
    code: "instagram",
    label: "Instagram Caption",
    shortLabel: "Instagram",
    icon: "Instagram",
    charLimit: 2200,
    description: "120-700 char engaging caption",
  },
  newsletter: {
    code: "newsletter",
    label: "Email Newsletter",
    shortLabel: "Newsletter",
    icon: "Mail",
    charLimit: 5000,
    description: "200-500 word personal email",
  },
  tiktok: {
    code: "tiktok",
    label: "TikTok Caption",
    shortLabel: "TikTok",
    icon: "Music",
    charLimit: 4000,
    description: "100-300 char casual caption",
  },
  "youtube-shorts": {
    code: "youtube-shorts",
    label: "YouTube Shorts",
    shortLabel: "YT Shorts",
    icon: "Youtube",
    charLimit: 70,
    description: "50-70 char clickable title",
  },
};
