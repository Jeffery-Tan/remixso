import DodoPayments from "dodopayments";
import type { SubscriptionStatus } from "@/types/user";

// Dodo Payments 客户端（惰性初始化）
let _dodo: DodoPayments | null = null;
function getDodo(): DodoPayments {
  if (!_dodo) {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      throw new Error("DODO_PAYMENTS_API_KEY is not set");
    }
    _dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      environment:
        (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ??
        "test_mode",
    });
  }
  return _dodo;
}

// Dodo 订阅状态 → 数据库状态映射
export function mapDodoStatus(dodoStatus: string, trialPeriodDays?: number): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    pending: "inactive",
    active: (trialPeriodDays != null && trialPeriodDays > 0) ? "trialing" : "active",
    on_hold: "past_due",
    cancelled: "canceled",
    failed: "past_due",
    expired: "expired",
  };
  return map[dodoStatus] ?? "inactive";
}

// 创建结账 URL
export async function createCheckoutUrl(params: {
  email?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
}): Promise<string> {
  const dodo = getDodo();

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      { product_id: process.env.DODO_PRO_PRODUCT_ID!, quantity: 1 },
    ],
    customer: {
      email: params.email!,
      name: params.email!,
    },
    return_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data:
      params.trialPeriodDays != null
        ? { trial_period_days: params.trialPeriodDays }
        : {},
    metadata: { user_id: params.userId },
  });

  const url = session.checkout_url;
  if (!url) throw new Error("Failed to create Dodo Payments checkout URL");
  return url;
}

// 获取订阅详情
export async function getDodoSubscription(subscriptionId: string) {
  const dodo = getDodo();
  return dodo.subscriptions.retrieve(subscriptionId);
}

// 取消订阅（在周期结束时取消）
export async function cancelDodoSubscription(subscriptionId: string) {
  const dodo = getDodo();
  await dodo.subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: true,
    cancel_reason: "cancelled_by_customer",
  });
}

// 验证 Webhook 签名
export function verifyWebhookSignature(
  rawBody: string,
  headers: Record<string, string>
): boolean {
  const dodo = getDodo();
  try {
    dodo.webhooks.unwrap(rawBody, { headers });
    return true;
  } catch {
    return false;
  }
}

// 解析 Webhook payload（已验证后调用）
export function unwrapWebhook(rawBody: string, headers: Record<string, string>) {
  const dodo = getDodo();
  return dodo.webhooks.unwrap(rawBody, { headers });
}

// 通过邮箱查找 Dodo 订阅（Webhook 缺失时的兜底方案）
// 返回找到的第一个活跃订阅，或 null
export async function findSubscriptionByEmail(email: string) {
  const dodo = getDodo();

  // Step 1: 通过邮箱查客户
  const customers = await dodo.customers.list({ email, page_size: 5 });
  const customerList = customers.items ?? [];
  if (customerList.length === 0) return null;

  const customerId = customerList[0].customer_id;

  // Step 2: 查该客户的订阅（优先取 active/pending）
  const subs = await dodo.subscriptions.list({ customer_id: customerId, page_size: 10 });
  const subList = subs.items ?? [];
  if (subList.length === 0) return null;

  const active = subList.find((s) => s.status === "active" || s.status === "pending");
  return active ?? subList[0];
}
