import { createClient } from "@/lib/supabase/server";
import { applyReferralCode } from "@/lib/referral";
import { NextResponse } from "next/server";

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

  // 自动兑换邀请码（从 cookie 读取）
  let refApplied = "";
  const refCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)remixso-ref=([^;]*)/)?.[1];

  if (refCookie) {
    const refCode = decodeURIComponent(refCookie);

    // 获取刚建立的 session 的用户 ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const result = await applyReferralCode(user.id, refCode);
      refApplied = result.success
        ? `ref_applied=${result.bonusAwarded}`
        : "ref_applied=0";
    }
  }

  const redirectTo = searchParams.get("next") ?? `${origin}/dashboard`;
  const separator = redirectTo.includes("?") ? "&" : "?";

  const response = NextResponse.redirect(
    new URL(`${redirectTo}${refApplied ? `${separator}${refApplied}` : ""}`, request.url)
  );

  // 清除 ref cookie
  if (refCookie) {
    response.headers.set(
      "Set-Cookie",
      "remixso-ref=; path=/; max-age=0; SameSite=Lax"
    );
  }

  return response;
}
