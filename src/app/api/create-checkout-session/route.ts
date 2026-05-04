import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutUrl } from "@/lib/dodo";

// POST /api/create-checkout-session —— 创建 Dodo Payments Checkout
// 已登录用户调用，重定向到 Dodo Payments 付款页

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 检查是否已订阅
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing")
    ) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    // 防薅：只有从未有过订阅记录的用户才给 7 天试用
    const hasHistory =
      subscription?.status === "canceled" ||
      subscription?.status === "expired" ||
      subscription?.status === "past_due";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const url = await createCheckoutUrl({
      email: user.email,
      userId: user.id,
      successUrl: `${appUrl}/account?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=canceled`,
      trialPeriodDays: hasHistory ? 0 : 7,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
