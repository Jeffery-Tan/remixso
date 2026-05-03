import * as cheerio from "cheerio";
import { promises as dns } from "dns";

// 内网 / 保留地址段黑名单，防止 SSRF
const BLOCKED_IP_PATTERNS = [
  /^127\./,                           // 127.0.0.0/8 loopback
  /^10\./,                            // 10.0.0.0/8 private
  /^172\.(1[6-9]|2\d|3[01])\./,      // 172.16.0.0/12 private
  /^192\.168\./,                      // 192.168.0.0/16 private
  /^169\.254\./,                      // 169.254.0.0/16 link-local
  /^0\./,                             // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 CGNAT
];

function isPrivateIP(ip: string): boolean {
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return true;
  // IPv6 mapped IPv4
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  return BLOCKED_IP_PATTERNS.some((p) => p.test(ip));
}

async function resolveAndValidate(hostname: string): Promise<void> {
  // 如果 hostname 已经是 IP，直接检查
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error("Access to internal network addresses is blocked");
    }
    return;
  }

  // DNS 解析后检查所有 IP
  try {
    const addresses = await dns.resolve4(hostname);
    for (const ip of addresses) {
      if (isPrivateIP(ip)) {
        throw new Error("Access to internal network addresses is blocked");
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access to internal")) {
      throw err;
    }
    // DNS 解析失败，允许继续（fetch 会自行处理错误）
  }
}

// URL 抓取 + 正文提取
// 从目标网页提取标题和正文内容

export async function fetchUrlContent(
  url: string
): Promise<{ title: string; content: string }> {
  // 验证 URL 格式
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP/HTTPS URLs are supported");
  }

  // DNS 解析 + 内网 IP 黑名单检查
  await resolveAndValidate(parsedUrl.hostname);

  // 抓取网页
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "RemixSo/1.0 ContentFetcher",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 提取标题
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    parsedUrl.hostname;

  // 移除无用元素
  $(
    "script, style, nav, footer, header, aside, .sidebar, .comments, .ads, .cookie-banner, .nav, .menu, .footer, .header"
  ).remove();

  // 提取正文：优先 article 标签，其次 main，最后 body
  let bodyText = "";
  const article = $("article");
  if (article.length > 0) {
    bodyText = article.text();
  } else {
    const main = $("main");
    bodyText = main.length > 0 ? main.text() : $("body").text();
  }

  // 清洗文本：合并空白、去首尾空行
  const cleaned = bodyText
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 限制抓取长度（前 8000 字符足够语气分析 + 改写）
  const truncated = cleaned.slice(0, 8000);

  if (truncated.length < 100) {
    throw new Error("Extracted content is too short");
  }

  return { title: title.trim(), content: truncated };
}
