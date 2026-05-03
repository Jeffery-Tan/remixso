import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// GET /api/debug-stripe —— 调试端点，查看 Stripe 和 Supabase 状态
// 仅开发环境使用

export async function GET() {
  const logs: string[] = [];
  const errors: string[] = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    logs.push(`Auth OK: user_id=${user.id}, email=${user.email}`);

    // 1. 查 Supabase subscriptions 表
    const { data: dbSub, error: dbError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (dbError) {
      logs.push(`DB query error: ${dbError.message} (code: ${dbError.code})`);
    } else if (!dbSub) {
      logs.push("DB: no subscription row found");
    } else {
      logs.push(`DB row: ${JSON.stringify(dbSub)}`);
    }

    // 2. 查 Stripe customers by email
    const customers = await stripe.customers.list({ email: user.email, limit: 20 });
    logs.push(`Stripe customers by email: ${customers.data.length}`);

    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, limit: 5 });
      logs.push(`  Customer ${c.id} (created ${new Date(c.created * 1000).toISOString()}): ${subs.data.length} subscriptions`);
      for (const s of subs.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = s as any;
        logs.push(`    Sub ${s.id}: status=${s.status}, trial_start=${sub.trial_start}, trial_end=${sub.trial_end}, period_start=${sub.current_period_start}, period_end=${sub.current_period_end}`);
      }
    }

    // 3. 按 metadata.user_id 查找 Stripe customers
    const customersByMeta = await stripe.customers.list({ limit: 50 });
    const matchingCustomers = customersByMeta.data.filter(
      (c) => c.metadata?.user_id === user.id
    );
    logs.push(`Stripe customers with metadata.user_id=${user.id}: ${matchingCustomers.length}`);
    for (const c of matchingCustomers) {
      logs.push(`  ${c.id} (email: ${c.email})`);
    }

    return NextResponse.json({ logs, errors });
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      logs,
      errors,
    }, { status: 500 });
  }
}
