import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getOrCreateStripeCustomer, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";

// POST /api/create-checkout-session —— 创建 Stripe Checkout Session
// 已登录用户调用，重定向到 Stripe 付款页

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

    // 获取或创建 Stripe Customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      user.id,
      user.email
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 创建 Checkout Session
    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      throw new Error("Stripe returned no checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
