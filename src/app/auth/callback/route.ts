import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 认证回调 —— OAuth + Magic Link 共用
// OAuth: Supabase 带着 code 参数重定向到此
// Magic Link: Supabase 带着 token_hash + type 参数重定向到此

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email" | "recovery" | "invite",
    });
  }

  const redirectTo = searchParams.get("next") ?? `${origin}/dashboard`;
  return NextResponse.redirect(redirectTo);
}
