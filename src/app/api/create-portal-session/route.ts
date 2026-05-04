import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cancelDodoSubscription } from "@/lib/dodo";

// POST /api/create-portal-session —— 取消 Dodo Payments 订阅
// 调用 Dodo API 取消，同时更新本地 DB

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    await cancelDodoSubscription(subscription.subscription_id);

    // Dodo 设置为到期取消（cancel_at_next_billing_date），同步状态到本地 DB
    const serviceClient = createServiceClient();
    await serviceClient
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
