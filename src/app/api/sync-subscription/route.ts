import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { SubscriptionStatus } from "@/types/user";

// POST /api/sync-subscription —— 手动从 Stripe 同步订阅状态
// 开发环境用，不需要 Stripe CLI / webhook
// 生产环境 webhook 是主要同步通道，这个是兜底

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

export async function POST() {
  const steps: string[] = [];

  try {
    // Step 1: 认证
    steps.push("auth_start");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    steps.push("auth_done");

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", steps },
        { status: 401 }
      );
    }
    steps.push(`user=${user.id}`);

    // Step 2: 查 DB
    steps.push("db_query_start");
    const { data: dbSub, error: dbError } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    steps.push(
      `db_query_done: found=${!!dbSub}, err=${dbError?.code ?? "none"}`
    );

    let stripeCustomerId = dbSub?.stripe_customer_id ?? null;
    let stripeSubId = dbSub?.stripe_subscription_id ?? null;

    // Step 3: 如果没有 customer_id，从 Stripe 查
    if (!stripeCustomerId && user.email) {
      steps.push("stripe_search_customer_start");
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 20,
        });
        steps.push(`stripe_customers_found=${customers.data.length}`);

        for (const c of customers.data) {
          try {
            const subs = await stripe.subscriptions.list({
              customer: c.id,
              limit: 5,
            });
            if (subs.data.length > 0) {
              stripeCustomerId = c.id;
              steps.push(`found_customer_with_sub=${c.id}`);
              break;
            }
          } catch (e) {
            steps.push(`list_sub_err_for_${c.id}: ${String(e)}`);
          }
        }

        if (!stripeCustomerId && customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
          steps.push(`fallback_to_first_customer=${stripeCustomerId}`);
        }
      } catch (e) {
        steps.push(`stripe_list_customers_error: ${String(e)}`);
        return NextResponse.json({
          synced: false,
          reason: "Stripe customer lookup failed",
          steps,
        });
      }
    }

    // Step 4: 如果没有 subscription_id，从 Stripe 查
    if (!stripeSubId && stripeCustomerId) {
      steps.push("stripe_find_sub_start");
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 5,
        });
        steps.push(
          `subs_found=${subscriptions.data.length}: [${subscriptions.data.map((s) => `${s.id}(${s.status})`).join(", ")}]`
        );
        stripeSubId = subscriptions.data[0]?.id ?? null;
      } catch (e) {
        steps.push(`stripe_list_sub_error: ${String(e)}`);
      }
    }

    if (!stripeSubId) {
      return NextResponse.json({
        synced: false,
        reason: `No subscription found. customerId=${stripeCustomerId}`,
        steps,
      });
    }
    steps.push(`stripeSubId=${stripeSubId}`);

    // Step 5: 从 Stripe 拉订阅详情
    steps.push("stripe_retrieve_sub_start");
    let stripeSub;
    try {
      stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
      steps.push(`stripe_retrieve_done: status=${stripeSub.status}`);
    } catch (e) {
      steps.push(`stripe_retrieve_error: ${String(e)}`);
      return NextResponse.json({
        synced: false,
        reason: `Failed to retrieve subscription ${stripeSubId}: ${String(e)}`,
        steps,
      });
    }

    // Step 6: 安全提取字段
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = stripeSub as any;
    const priceId = stripeSub.items?.data?.[0]?.price?.id ?? null;
    const status = mapStripeStatus(s.status ?? "inactive");
    const trialStart = safeDate(s.trial_start);
    const trialEnd = safeDate(s.trial_end);
    const periodStart = safeDate(s.current_period_start);
    const periodEnd = safeDate(s.current_period_end);
    const canceledAt = safeDate(s.canceled_at);

    steps.push(
      `fields: status=${status}, trial=${trialStart}, period=${periodStart}`
    );

    // Step 7: 写入 DB
    steps.push("db_upsert_start");
    const serviceClient = createServiceClient();
    const result = await serviceClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: stripeCustomerId ?? undefined,
        stripe_subscription_id: stripeSubId,
        stripe_price_id: priceId,
        status,
        trial_started_at: trialStart,
        trial_ends_at: trialEnd,
        current_period_start_at: periodStart,
        current_period_ends_at: periodEnd,
        canceled_at: canceledAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (result.error) {
      steps.push(`db_upsert_error: ${result.error.message} (${result.error.code})`);
      return NextResponse.json({
        synced: false,
        reason: `DB upsert failed: ${result.error.message}`,
        steps,
      });
    }
    steps.push("db_upsert_done");

    return NextResponse.json({
      synced: true,
      status,
      steps,
    });
  } catch (err) {
    return NextResponse.json({
      synced: false,
      error: "Unexpected exception",
      detail: String(err),
      steps,
    }, { status: 500 });
  }
}
