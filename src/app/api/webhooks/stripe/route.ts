import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/types/user";

// POST /api/webhooks/stripe —— 处理 Stripe Webhook 事件
// 同步 Stripe 订阅状态到 Supabase subscriptions 表

export const dynamic = "force-dynamic";

// Stripe 订阅状态 → 数据库状态映射
function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "inactive",
    incomplete_expired: "inactive",
  };
  return map[stripeStatus] ?? "inactive";
}

function safeDate(ts: number | null | undefined): string | null {
  if (ts == null || ts === 0) return null;
  try {
    return new Date(ts * 1000).toISOString();
  } catch {
    return null;
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createServiceClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : null;

  if (!userId || !stripeSubscriptionId) {
    console.warn("checkout.session.completed: missing data", {
      userId,
      stripeSubscriptionId,
    });
    return;
  }

  // 从 Stripe 获取完整订阅信息
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const priceId = sub.items.data[0]?.price?.id ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = sub as any;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId!,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: priceId,
      status: mapStripeStatus(sub.status),
      trial_started_at: safeDate(s.trial_start),
      trial_ends_at: safeDate(s.trial_end),
      current_period_start_at: safeDate(s.current_period_start),
      current_period_ends_at: safeDate(s.current_period_end),
      canceled_at: safeDate(s.canceled_at),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;

  if (!stripeSubscriptionId) return;

  const priceId = subscription.items.data[0]?.price?.id ?? undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = subscription as any;

  await supabase
    .from("subscriptions")
    .update({
      status: mapStripeStatus(s.status),
      stripe_price_id: priceId,
      trial_started_at: safeDate(s.trial_start) ?? undefined,
      trial_ends_at: safeDate(s.trial_end) ?? undefined,
      current_period_start_at: safeDate(s.current_period_start),
      current_period_ends_at: safeDate(s.current_period_end),
      canceled_at: safeDate(s.canceled_at),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;

  if (!stripeSubscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // 处理事件，非签名错误都返回 200 避免 Stripe 无限重试
  try {
    const supabase = createServiceClient();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;

      default:
        // 忽略不处理的事件类型
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // 返回 200 避免 Stripe 重试，错误已记录到日志
  }

  return NextResponse.json({ received: true });
}
