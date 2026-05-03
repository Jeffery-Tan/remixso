// 简易内存限流 — 每 IP 每分钟默认 5 次
//
// ⚠️ 生产环境注意事项：
// 本实现使用进程内 Map 存储，在 serverless 平台（Vercel、Netlify 等）
// 上多实例共享同一份限流状态会失效——每个实例有独立的 Map。
//
// 生产环境建议：
//   - Upstash Redis (@upstash/ratelimit) — 最快接入
//   - Vercel KV (@vercel/kv) — 如果已用 Vercel
//   - 或在 Supabase 中建表用 PG 函数做滑动窗口计数
//
// 本地开发 / 单实例部署可直接使用。

const hits = new Map<string, { count: number; resetAt: number }>();

// 每 60 秒清理一次过期条目
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
  lastCleanup = now;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 60_000
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
