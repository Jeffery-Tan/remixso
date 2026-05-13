import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// POST /api/referral/generate-code — 为当前用户生成唯一邀请码

export async function POST() {
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

    // 检查是否已有邀请码
    const { data: existing } = await serviceClient
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    if (existing?.referral_code) {
      return NextResponse.json({ referralCode: existing.referral_code });
    }

    // 生成 8 位随机邀请码
    const code = crypto.randomUUID().slice(0, 8);

    const { error: updateError } = await serviceClient
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", user.id);

    if (updateError) {
      // 并发冲突：可能同时有两个请求，重新读取
      const { data: retry } = await serviceClient
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      if (retry?.referral_code) {
        return NextResponse.json({ referralCode: retry.referral_code });
      }

      throw updateError;
    }

    return NextResponse.json({ referralCode: code });
  } catch (err) {
    console.error("/api/referral/generate-code error:", err);
    return NextResponse.json(
      { error: "Failed to generate code", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
