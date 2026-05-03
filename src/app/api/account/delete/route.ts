import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// DELETE /api/account/delete — 永久删除账号及所有数据

export async function DELETE(_req: NextRequest) {
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

    const serviceClient = createServiceClient();

    // 1. 查找并取消 Stripe 订阅
    const { data: sub } = await serviceClient
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (sub?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (e) {
        console.warn("[delete-account] Stripe cancel failed:", e);
        // 继续执行，即使 Stripe 取消失败也要删本地数据
      }
    }

    // 2. 删除用户相关数据（按外键依赖顺序）
    await serviceClient
      .from("platform_outputs")
      .delete()
      .eq("user_id", user.id);

    await serviceClient.from("generations").delete().eq("user_id", user.id);

    await serviceClient
      .from("usage_credits")
      .delete()
      .eq("user_id", user.id);

    await serviceClient
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);

    await serviceClient.from("profiles").delete().eq("id", user.id);

    // 3. 删除 Supabase Auth 账号
    const { error: deleteAuthError } =
      await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error("[delete-account] Auth deletion failed:", deleteAuthError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
