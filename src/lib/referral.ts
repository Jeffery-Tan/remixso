import { createServiceClient } from "@/lib/supabase/server";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/credit-manager";

export type ApplyResult =
  | { success: true; bonusAwarded: number; referrerName: string }
  | { success: false; code: "INVALID_CODE" | "SELF_REFERRAL" | "ALREADY_REFERRED" | "SERVER_ERROR"; error: string };

async function addBonus(userId: string, amount: number) {
  const serviceClient = createServiceClient();

  const { data: row } = await serviceClient
    .from("usage_credits")
    .select("id, bonus_generations")
    .eq("user_id", userId)
    .single();

  if (row) {
    const newBonus = (row.bonus_generations ?? 0) + amount;
    await serviceClient
      .from("usage_credits")
      .update({ bonus_generations: newBonus })
      .eq("user_id", userId);
  } else {
    await serviceClient.from("usage_credits").insert({
      user_id: userId,
      free_generations_used: 0,
      bonus_generations: amount,
      free_reset_at: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }
}

export async function applyReferralCode(
  userId: string,
  code: string
): Promise<ApplyResult> {
  try {
    const serviceClient = createServiceClient();

    const { data: referrer } = await serviceClient
      .from("profiles")
      .select("id, full_name")
      .eq("referral_code", code)
      .single();

    if (!referrer) {
      return { success: false, code: "INVALID_CODE", error: "Invalid referral code" };
    }

    if (referrer.id === userId) {
      return { success: false, code: "SELF_REFERRAL", error: "Cannot use your own referral code" };
    }

    const { data: currentProfile } = await serviceClient
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (currentProfile?.referred_by) {
      return { success: false, code: "ALREADY_REFERRED", error: "Already referred" };
    }

    const { error: updateError, count } = await serviceClient
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", userId)
      .is("referred_by", null);

    if (updateError || count === 0) {
      return { success: false, code: "ALREADY_REFERRED", error: "Already referred" };
    }

    await addBonus(referrer.id, REFERRAL_BONUS_AMOUNT);
    await addBonus(userId, REFERRAL_BONUS_AMOUNT);

    return {
      success: true,
      bonusAwarded: REFERRAL_BONUS_AMOUNT,
      referrerName: referrer.full_name ?? "a friend",
    };
  } catch (err) {
    console.error("applyReferralCode error:", err);
    return { success: false, code: "SERVER_ERROR", error: "Server error" };
  }
}
