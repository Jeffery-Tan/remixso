import { createBrowserClient } from "@supabase/ssr";

// 浏览器端 Supabase 客户端
// 用于 Client Components 中的认证和查询

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
