import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

// Stripe 服务端实例
// 使用默认 API 版本（stripe v22 对应 2025-03-31.basil）

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;

// 获取或创建 Stripe Customer
// 如果用户已有 stripe_customer_id 则直接返回，否则创建新的并写入 subscriptions 表

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = createServiceClient();

  // 查已有 Stripe Customer ID
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // 在 Stripe 创建 Customer
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  // 写入 subscriptions 表（upsert on user_id 唯一约束）
  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
      status: "inactive",
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    console.error("[stripe] Failed to write stripe_customer_id to DB:", {
      userId,
      customerId: customer.id,
      error: upsertError,
    });
  }

  return customer.id;
}
