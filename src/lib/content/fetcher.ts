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

// JS 渲染平台黑名单 —— 这些网站返回的是空壳 HTML
const JS_RENDERED_HOSTS = [
  /(^|\.)x\.com$/,
  /(^|\.)twitter\.com$/,
  /(^|\.)instagram\.com$/,
  /(^|\.)tiktok\.com$/,
  /(^|\.)facebook\.com$/,
  /(^|\.)threads\.net$/,
];

function isJsRenderedHost(hostname: string): boolean {
  return JS_RENDERED_HOSTS.some((p) => p.test(hostname));
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
    throw new Error(
      "Invalid URL. Please paste a full link starting with https://"
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP/HTTPS URLs are supported");
  }

  // JS 渲染平台提前拦截
  if (isJsRenderedHost(parsedUrl.hostname)) {
    throw new Error(
      "This platform doesn't allow content extraction. Try pasting the text directly instead."
    );
  }

  // DNS 解析 + 内网 IP 黑名单检查
  await resolveAndValidate(parsedUrl.hostname);

  // 抓取网页
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    const name = (err as Error)?.name ?? "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new Error(
        "The website took too long to respond. It may be behind a paywall or blocking automated access. Try pasting the text manually."
      );
    }
    throw new Error(
      "Could not reach the website. Check the URL or paste the text directly."
    );
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error(
        "This website is blocking content extraction. Try pasting the text directly instead."
      );
    }
    throw new Error(
      `This page couldn't be loaded (error ${response.status}). Try another URL or paste the text manually.`
    );
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
    throw new Error(
      "Couldn't extract enough content from this page. The article may be behind a login or paywall. Try pasting the text directly."
    );
  }

  return { title: title.trim(), content: truncated };
}
