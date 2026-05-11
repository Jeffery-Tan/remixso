import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

// 额度配置
export const FREE_MONTHLY_LIMIT = 5;
export const PRO_MONTHLY_LIMIT = 100;
export const ANONYMOUS_LIFETIME_LIMIT = 1;

// 检查积分是否够用（原子操作，防竞态）
export async function checkAndDeductCredit(
  userId: string | null,
  sessionId: string | null
): Promise<{
  allowed: boolean;
  remaining: number;
  isSubscribed: boolean;
}> {
  const supabase = createServiceClient();

  if (userId) {
    // 登录用户：先检查订阅状态
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .single();

    const isSubscribed =
      subscription?.status === "active" ||
      subscription?.status === "trialing";

    const monthlyLimit = isSubscribed ? PRO_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;
    const now = new Date();
    const resetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 查当前用量（可能没有行——新用户首次生成）
    const { data: credits } = await supabase
      .from("usage_credits")
      .select("free_generations_used, free_reset_at")
      .eq("user_id", userId)
      .single();

    if (!credits) {
      // 新用户：首次生成，INSERT 初始行
      const { error: insertError } = await supabase
        .from("usage_credits")
        .insert({
          user_id: userId,
          free_generations_used: 1,
          free_reset_at: resetAt.toISOString(),
        });

      if (!insertError) {
        return {
          allowed: true,
          remaining: monthlyLimit - 1,
          isSubscribed,
        };
      }
      // INSERT 失败（并发冲突），重试读取
      const { data: retry } = await supabase
        .from("usage_credits")
        .select("free_generations_used, free_reset_at")
        .eq("user_id", userId)
        .single();

      if (!retry) {
        return { allowed: false, remaining: 0, isSubscribed };
      }
      const retryUsed = retry.free_generations_used ?? 0;
      if (retryUsed >= monthlyLimit) {
        return { allowed: false, remaining: 0, isSubscribed };
      }
      // 乐观锁递增
      const { data: retryLocked } = await supabase
        .from("usage_credits")
        .update({ free_generations_used: retryUsed + 1 })
        .eq("user_id", userId)
        .eq("free_generations_used", retryUsed)
        .select("free_generations_used")
        .single();

      if (!retryLocked) {
        return { allowed: false, remaining: 0, isSubscribed };
      }
      return {
        allowed: true,
        remaining: monthlyLimit - (retryUsed + 1),
        isSubscribed,
      };
    }

    // 已有行：检查是否需要重置
    const currentResetAt = credits.free_reset_at
      ? new Date(credits.free_reset_at)
      : new Date(0);
    let currentUsed = credits.free_generations_used ?? 0;

    if (now >= currentResetAt) {
      // 重置：将已用归零，设置新的重置日期
      const { data: resetLocked } = await supabase
        .from("usage_credits")
        .update({
          free_generations_used: 1,
          free_reset_at: resetAt.toISOString(),
        })
        .eq("user_id", userId)
        .eq("free_generations_used", currentUsed)
        .select("free_generations_used")
        .single();

      if (!resetLocked) {
        return { allowed: false, remaining: 0, isSubscribed };
      }
      return {
        allowed: true,
        remaining: monthlyLimit - 1,
        isSubscribed,
      };
    }

    const remaining = monthlyLimit - currentUsed;
    if (remaining <= 0) {
      return { allowed: false, remaining: 0, isSubscribed };
    }

    // 乐观锁递增
    const { data: locked } = await supabase
      .from("usage_credits")
      .update({ free_generations_used: currentUsed + 1 })
      .eq("user_id", userId)
      .eq("free_generations_used", currentUsed)
      .select("free_generations_used")
      .single();

    if (!locked) {
      return { allowed: false, remaining: 0, isSubscribed };
    }

    return {
      allowed: true,
      remaining: monthlyLimit - (currentUsed + 1),
      isSubscribed,
    };
  }

  // 匿名用户：两段乐观锁，防竞态
  if (sessionId) {
    // 先尝试 INSERT——新 session 的第一条记录
    const { error: insertError } = await supabase
      .from("usage_credits")
      .insert({
        anonymous_session_id: sessionId,
        free_generations_used: 1,
        free_reset_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

    if (!insertError) {
      return {
        allowed: true,
        remaining: ANONYMOUS_LIFETIME_LIMIT - 1,
        isSubscribed: false,
      };
    }

    // 行已存在，读取当前值
    const { data: credits } = await supabase
      .from("usage_credits")
      .select("free_generations_used")
      .eq("anonymous_session_id", sessionId)
      .single();

    const used = credits?.free_generations_used ?? 0;

    if (used >= ANONYMOUS_LIFETIME_LIMIT) {
      return { allowed: false, remaining: 0, isSubscribed: false };
    }

    // 乐观锁递增：仅当值未被并发修改时才写入
    const { data: updated } = await supabase
      .from("usage_credits")
      .update({ free_generations_used: used + 1 })
      .eq("anonymous_session_id", sessionId)
      .eq("free_generations_used", used)
      .select("free_generations_used")
      .single();

    if (!updated) {
      return { allowed: false, remaining: 0, isSubscribed: false };
    }

    return {
      allowed: true,
      remaining: ANONYMOUS_LIFETIME_LIMIT - (used + 1),
      isSubscribed: false,
    };
  }

  return { allowed: false, remaining: 0, isSubscribed: false };
}

// 获取用户积分信息
export async function getCreditInfo(
  userId: string | null,
  sessionId: string | null
): Promise<{
  freeTotal: number;
  freeUsed: number;
  freeRemaining: number;
  isSubscribed: boolean;
  freeResetAt: string | null;
}> {
  const supabase = createServiceClient();

  if (!userId && !sessionId) {
    return {
      freeTotal: ANONYMOUS_LIFETIME_LIMIT,
      freeUsed: 0,
      freeRemaining: ANONYMOUS_LIFETIME_LIMIT,
      isSubscribed: false,
      freeResetAt: null,
    };
  }

  const column = userId ? "user_id" : "anonymous_session_id";
  const value = userId ?? sessionId;

  const { data: credits } = await supabase
    .from("usage_credits")
    .select("free_generations_used, free_reset_at")
    .eq(column, value)
    .single();

  const freeUsed = credits?.free_generations_used ?? 0;

  // 检查订阅状态
  let isSubscribed = false;
  if (userId) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .single();

    isSubscribed =
      subscription?.status === "active" ||
      subscription?.status === "trialing";
  }

  const freeTotal = isSubscribed
    ? PRO_MONTHLY_LIMIT
    : userId
      ? FREE_MONTHLY_LIMIT
      : ANONYMOUS_LIFETIME_LIMIT;

  return {
    freeTotal,
    freeUsed,
    freeRemaining: Math.max(0, freeTotal - freeUsed),
    isSubscribed,
    freeResetAt: credits?.free_reset_at ?? null,
  };
}
