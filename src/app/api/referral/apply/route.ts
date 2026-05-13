import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyReferralCode } from "@/lib/referral";

// POST /api/referral/apply — 兑换邀请码，双方获得奖励

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const code = body?.code?.trim();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Referral code is required", code: "INVALID_CODE" },
        { status: 400 }
      );
    }

    const result = await applyReferralCode(user.id, code);

    if (result.success) {
      return NextResponse.json({
        bonusAwarded: result.bonusAwarded,
        referrerName: result.referrerName,
      });
    }

    const statusMap: Record<string, number> = {
      INVALID_CODE: 400,
      SELF_REFERRAL: 400,
      ALREADY_REFERRED: 400,
      SERVER_ERROR: 500,
    };

    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: statusMap[result.code] ?? 500 }
    );
  } catch (err) {
    console.error("/api/referral/apply error:", err);
    return NextResponse.json(
      { error: "Failed to apply referral code", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
