// 调试脚本：检查 Stripe 里的真实状态
// 运行方式：npx tsx scripts/debug-stripe.ts <user_email>

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("用法: npx tsx scripts/debug-stripe.ts <user_email>");
    process.exit(1);
  }

  console.log("=== 1. 按 email 查 Stripe customers ===");
  const customers = await stripe.customers.list({ email, limit: 20 });
  console.log(`找到 ${customers.data.length} 个 customer:`);
  for (const c of customers.data) {
    console.log(`  - id: ${c.id}, email: ${c.email}, created: ${new Date(c.created * 1000).toISOString()}`);
  }

  console.log("\n=== 2. 每个 customer 的 subscriptions ===");
  for (const c of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: c.id, limit: 5 });
    console.log(`  Customer ${c.id}: ${subs.data.length} 个 subscription`);
    for (const s of subs.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = s as any;
      console.log(`    - id: ${s.id}`);
      console.log(`      status: ${s.status}`);
      console.log(`      trial_start: ${sub.trial_start}`);
      console.log(`      trial_end: ${sub.trial_end}`);
      console.log(`      current_period_start: ${sub.current_period_start}`);
      console.log(`      current_period_end: ${sub.current_period_end}`);
      console.log(`      canceled_at: ${sub.canceled_at}`);
      console.log(`      items: ${JSON.stringify(s.items.data.map(i => ({ price: i.price?.id })))}`);
    }
  }

  console.log("\n=== 3. 所有 subscriptions (limit 10) ===");
  const allSubs = await stripe.subscriptions.list({ limit: 10 });
  for (const s of allSubs.data) {
    console.log(`  - id: ${s.id}, customer: ${s.customer}, status: ${s.status}`);
  }

  console.log("\n=== 调试完成 ===");
}

main().catch(console.error);
