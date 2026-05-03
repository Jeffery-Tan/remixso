import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Google OAuth 回调处理
// 用户登录后 Supabase 重定向到此，用 code 换取 session

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 重定向到首页或之前访问的页面
  const redirectTo = searchParams.get("next") ?? `${origin}/dashboard`;
  return NextResponse.redirect(redirectTo);
}
