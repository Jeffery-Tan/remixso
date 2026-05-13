import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET /api/referral/stats — 返回当前用户的邀请数据

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();

    // 自己的邀请码和被邀请信息
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("referral_code, referred_by")
      .eq("id", user.id)
      .single();

    // 已邀请人数
    const { count: totalInvited } = await serviceClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", user.id);

    // Bonus 额度
    const { data: credits } = await serviceClient
      .from("usage_credits")
      .select("bonus_generations")
      .eq("user_id", user.id)
      .single();

    // 邀请人信息
    let referredBy: { name: string } | null = null;
    if (profile?.referred_by) {
      const { data: referrer } = await serviceClient
        .from("profiles")
        .select("full_name")
        .eq("id", profile.referred_by)
        .single();

      referredBy = referrer
        ? { name: referrer.full_name ?? "Anonymous" }
        : null;
    }

    return NextResponse.json({
      referralCode: profile?.referral_code ?? null,
      totalInvited: totalInvited ?? 0,
      totalBonus: credits?.bonus_generations ?? 0,
      isReferred: !!profile?.referred_by,
      referredBy,
    });
  } catch (err) {
    console.error("/api/referral/stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch referral stats", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
