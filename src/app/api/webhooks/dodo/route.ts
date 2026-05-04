import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature, unwrapWebhook, mapDodoStatus } from "@/lib/dodo";

// POST /api/webhooks/dodo —— 处理 Dodo Payments Webhook 事件
// 同步 Dodo 订阅状态到 Supabase subscriptions 表

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionEvent(
  supabase: ReturnType<typeof createServiceClient>,
  payload: any
) {
  const data = payload.data;
  if (!data) return;

  const subscriptionId = data.subscription_id ?? "";
  const status = data.status ?? "";
  const productId = data.product_id ?? null;
  const customerData = data.customer;
  const trialPeriodDays = data.trial_period_days ?? 0;

  // 尝试从 metadata 获取 user_id
  const metadataUserId = data.metadata?.user_id ?? null;
  let resolvedUserId = metadataUserId;

  // 如果没有 metadata user_id，通过 customer_id 查已有记录
  if (!resolvedUserId && customerData?.customer_id) {
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("customer_id", customerData.customer_id)
      .single();
    resolvedUserId = existing?.user_id ?? null;
  }

  if (!resolvedUserId) {
    console.warn("[dodo-webhook] Cannot resolve user_id", {
      subscriptionId,
    });
    return;
  }

  const dbStatus = mapDodoStatus(status, trialPeriodDays);
  const nextBilling = data.next_billing_date ?? null;
  const prevBilling = data.previous_billing_date ?? null;
  const cancelledAt = data.cancelled_at ?? null;

  await supabase.from("subscriptions").upsert(
    {
      user_id: resolvedUserId,
      customer_id: customerData?.customer_id ?? null,
      subscription_id: subscriptionId,
      variant_id: productId,
      status: dbStatus,
      trial_started_at: data.created_at ?? null,
      trial_ends_at: trialPeriodDays > 0
        ? new Date(new Date(data.created_at).getTime() + trialPeriodDays * 86400000).toISOString()
        : null,
      current_period_start_at: prevBilling,
      current_period_ends_at: nextBilling,
      canceled_at: cancelledAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("dodo-webhook-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing dodo-webhook-signature header" },
      { status: 400 }
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
    if (!verifyWebhookSignature(rawBody, { "dodo-webhook-signature": signature })) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // 处理事件
  try {
    const payload = unwrapWebhook(rawBody, {
      "dodo-webhook-signature": signature,
    });

    const supabase = createServiceClient();
    const eventType = payload.type ?? "";

    switch (eventType) {
      case "subscription.active":
      case "subscription.updated":
      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.on_hold":
      case "subscription.failed":
      case "subscription.renewed":
      case "subscription.plan_changed":
      case "payment.succeeded":
        await handleSubscriptionEvent(supabase, payload);
        break;

      default:
        // 忽略不处理的事件
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
