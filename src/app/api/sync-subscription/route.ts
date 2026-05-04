import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getDodoSubscription, findSubscriptionByEmail, mapDodoStatus } from "@/lib/dodo";

// POST /api/sync-subscription —— 从 Dodo Payments 同步订阅状态
// Webhook 是主要同步通道，这是兜底
// 请求体可选：{ subscription_id?: string } —— Dodo 返回 URL 参数中提取

export async function POST(request: NextRequest) {
  const steps: string[] = [];

  // 解析请求体中可选的 subscription_id（来自 Dodo return URL 参数）
  let bodySubId: string | null = null;
  try {
    const body = await request.json();
    bodySubId = body?.subscription_id ?? null;
  } catch {
    // body 为空或不是 JSON，忽略
  }

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

    // Step 2: 确定要查询的 Dodo subscription_id
    let dodoSubId = bodySubId;

    if (!dodoSubId) {
      // 从 DB 查找
      steps.push("db_query_start");
      const { data: dbSub, error: dbError } = await supabase
        .from("subscriptions")
        .select("subscription_id, customer_id")
        .eq("user_id", user.id)
        .single();
      steps.push(
        `db_query_done: found=${!!dbSub}, err=${dbError?.code ?? "none"}`
      );
      dodoSubId = dbSub?.subscription_id ?? null;
    } else {
      steps.push(`bodySubId=${dodoSubId}`);
    }

    if (!dodoSubId) {
      // Webhook 还没配，或首次付款后 DB 里没有 subscription_id
      // 通过用户邮箱去 Dodo 查找订阅
      steps.push("fallback: find_by_email_start");
      const found = await findSubscriptionByEmail(user.email!);
      steps.push(`fallback: find_by_email_done: found=${!!found}`);

      if (!found?.subscription_id) {
        return NextResponse.json({
          synced: false,
          reason: "No subscription found on Dodo for this email",
          steps,
        });
      }
      dodoSubId = found.subscription_id;

      // 列表里拿到的是 SubscriptionListResponse（精简版），字段够用，直接写 DB
      const status = mapDodoStatus(found.status, found.trial_period_days);
      const customerId = found.customer?.customer_id ?? null;
      const productId = found.product_id ?? null;
      const nextBilling = found.next_billing_date ?? null;
      const prevBilling = found.previous_billing_date ?? null;
      const cancelledAt = found.cancelled_at ?? null;

      steps.push(`fields: status=${status}, product=${productId}`);

      steps.push("db_upsert_start");
      const serviceClient = createServiceClient();
      const trialStart = found.created_at ?? null;
      const trialDays = found.trial_period_days ?? 0;
      const trialEnd = trialDays > 0 && trialStart
        ? new Date(new Date(trialStart).getTime() + trialDays * 86400000).toISOString()
        : null;

      const result = await serviceClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          customer_id: customerId,
          subscription_id: found.subscription_id,
          variant_id: productId,
          status,
          trial_started_at: trialStart,
          trial_ends_at: trialEnd,
          current_period_start_at: prevBilling,
          current_period_ends_at: nextBilling,
          canceled_at: cancelledAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (result.error) {
        steps.push(
          `db_upsert_error: ${result.error.message} (${result.error.code})`
        );
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
    }

    steps.push(`dodoSubId=${dodoSubId}`);

    // Step 3: 从 Dodo 拉订阅详情
    steps.push("dodo_retrieve_sub_start");
    let dodoSub;
    try {
      dodoSub = await getDodoSubscription(dodoSubId);
      steps.push(`dodo_retrieve_done: status=${dodoSub.status}`);
    } catch (e) {
      steps.push(`dodo_retrieve_error: ${String(e)}`);
      return NextResponse.json({
        synced: false,
        reason: `Failed to retrieve subscription ${dodoSubId}: ${String(e)}`,
        steps,
      });
    }

    // Step 4: 提取字段
    const status = mapDodoStatus(dodoSub.status, dodoSub.trial_period_days);
    const customerId = dodoSub.customer?.customer_id ?? null;
    const productId = dodoSub.product_id ?? null;
    const nextBilling = dodoSub.next_billing_date ?? null;
    const prevBilling = dodoSub.previous_billing_date ?? null;
    const cancelledAt = dodoSub.cancelled_at ?? null;

    steps.push(`fields: status=${status}, product=${productId}`);

    // Step 5: 写入 DB
    steps.push("db_upsert_start");
    const serviceClient = createServiceClient();
    const trialStart = dodoSub.created_at ?? null;
    const trialDays = dodoSub.trial_period_days ?? 0;
    const trialEnd = trialDays > 0 && trialStart
      ? new Date(new Date(trialStart).getTime() + trialDays * 86400000).toISOString()
      : null;

    const result = await serviceClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        customer_id: customerId,
        subscription_id: dodoSubId,
        variant_id: productId,
        status,
        trial_started_at: trialStart,
        trial_ends_at: trialEnd,
        current_period_start_at: prevBilling,
        current_period_ends_at: nextBilling,
        canceled_at: cancelledAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (result.error) {
      steps.push(
        `db_upsert_error: ${result.error.message} (${result.error.code})`
      );
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
    return NextResponse.json(
      {
        synced: false,
        error: "Unexpected exception",
        detail: String(err),
        steps,
      },
      { status: 500 }
    );
  }
}
