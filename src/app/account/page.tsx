import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  SubscribeButton,
  CancelSubscriptionButton,
} from "@/components/account/AccountActions";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";
import { CheckoutSuccessSync } from "@/components/account/CheckoutSuccessSync";
import { ReferralCard } from "@/components/account/ReferralCard";
import { redirect } from "next/navigation";
import { FREE_MONTHLY_LIMIT, PRO_MONTHLY_LIMIT } from "@/lib/credit-manager";

export const metadata: Metadata = {
  title: "Account",
};

// 格式化日期
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 距今天的剩余天数
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  const isCheckoutSuccess = params.checkout === "success";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  // 查订阅（新用户可能无记录，静默降级）
  let subscription = null;
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
    subscription = data;
  } catch {
    // 无订阅记录，保持 null
  }

  // 查用量
  let usage = null;
  try {
    const { data } = await supabase
      .from("usage_credits")
      .select("free_generations_used, free_reset_at")
      .eq("user_id", user.id)
      .single();
    usage = data;
  } catch {
    // 无用量记录，保持 null
  }

  const freeUsed = usage?.free_generations_used ?? 0;
  const subStatus = subscription?.status ?? "inactive";

  // 判断订阅视图状态
  const isTrialing = subStatus === "trialing";
  const isActive = subStatus === "active";
  const isSubscribed = isTrialing || isActive;

  const freeTotal = isSubscribed ? PRO_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT;
  const freeRemaining = Math.max(0, freeTotal - freeUsed);
  const trialDaysLeft = isTrialing
    ? daysUntil(subscription?.trial_ends_at ?? null)
    : null;

  return (
    <>
      {/* 网格渐变背景 */}
      <div className="mesh-gradient" />

      <Container className="py-16 relative">
        {isCheckoutSuccess && <CheckoutSuccessSync />}

        <h1 className="font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight mb-8">
          Account
        </h1>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* 订阅卡片 —— 玻璃拟态 + 内部发光 */}
          <section className="lg:col-span-7 glass-card-strong rounded-2xl p-8 relative overflow-hidden group">
            {/* 内部发光效果 */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--primary)]/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold flex items-center gap-3">
                    Subscription
                  </h2>
                  <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                    Manage your plan and billing
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--outline-variant)]/30 p-5 bg-[var(--surface-container-lowest)]/60">
                {isSubscribed ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-lg">RemixSo Pro</span>
                        <Badge variant="success" className="gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {isTrialing ? "Trial Active" : "Active"}
                        </Badge>
                      </div>

                      {isTrialing ? (
                        <div className="space-y-0.5">
                          <p className="text-sm text-[var(--on-surface-variant)]">
                            $19/month · Trial ends{" "}
                            {formatDate(subscription?.trial_ends_at ?? null)}
                          </p>
                          {trialDaysLeft !== null && trialDaysLeft > 0 && (
                            <p className="text-xs text-amber-600 font-medium">
                              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}{" "}
                              left in trial
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--on-surface-variant)]">
                          $19/month · Next billing{" "}
                          {formatDate(subscription?.current_period_ends_at ?? null)}
                        </p>
                      )}
                    </div>
                    <CancelSubscriptionButton isTrialing={isTrialing} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-lg">RemixSo Pro</span>
                        <Badge variant="outline" className="shrink-0">Inactive</Badge>
                      </div>
                      <p className="text-sm text-[var(--on-surface-variant)]">
                        $19/month · 7-day free trial · Cancel anytime
                      </p>
                    </div>
                    <SubscribeButton />
                  </div>
                )}
              </div>

              {/* 价格展示 */}
              <div className="mt-6">
                <div className="font-[family-name:var(--font-headline)] text-4xl font-bold flex items-baseline">
                  $19
                  <span className="text-base text-[var(--on-surface-variant)] ml-2 tracking-normal font-normal">
                    / month
                  </span>
                </div>
                {isSubscribed && subscription?.current_period_ends_at && (
                  <p className="text-sm text-[var(--outline)] mt-1">
                    Next billing date is{" "}
                    {formatDate(subscription.current_period_ends_at)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 用量卡片 —— 暗色高对比 */}
          <section
            className="lg:col-span-5 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "var(--foreground)",
              color: "var(--surface)",
            }}
          >
            {/* 纹理叠加 */}
            <div
              className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
              }}
            />
            <div className="relative z-10">
              <h3 className="font-[family-name:var(--font-headline)] text-2xl font-bold mb-1">
                Usage
              </h3>
              <p className="text-sm text-[var(--outline-variant)] mb-8">
                This month&apos;s activity
              </p>

              {isSubscribed ? (
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-[family-name:var(--font-headline)] text-2xl font-bold leading-none">
                      {freeUsed} / {freeTotal}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--primary-fixed-dim)] bg-[var(--primary-fixed-dim)]/10 px-3 py-1 rounded-full border border-[var(--primary-fixed-dim)]/20">
                      PRO
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--outline)]/20 rounded-full overflow-hidden border border-[var(--outline-variant)]/20 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary-fixed-dim)] via-purple-300 to-purple-400 rounded-full shadow-[0_0_10px_rgba(254,214,255,0.5)] transition-all"
                      style={{
                        width: `${Math.min(100, (freeUsed / freeTotal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Generations</span>
                      <span className="font-medium">
                        {freeUsed} / {freeTotal}
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--outline)]/20 rounded-full overflow-hidden border border-[var(--outline-variant)]/20 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary-fixed-dim)] to-[var(--primary)] rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (freeUsed / freeTotal) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-8 pt-4 border-t border-[var(--outline-variant)]/20 flex justify-between items-center">
              <span className="text-sm text-[var(--outline-variant)]">
                {isSubscribed ? "Generations remaining" : "Free remaining"}
              </span>
              <span className="text-sm font-medium">
                {String(freeRemaining)}
              </span>
            </div>
          </section>
        </div>

        {/* 邀请裂变 */}
        <div className="mt-6">
          <ReferralCard />
        </div>

        {/* 删除账号 */}
        <div className="mt-6 glass-card-strong rounded-2xl p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold text-sm">Delete account</h3>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <DeleteAccountButton />
          </div>
        </div>
      </Container>
    </>
  );
}
