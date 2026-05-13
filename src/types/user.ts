// 用户资料
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

// 订阅状态
export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused";

// 订阅信息
export interface Subscription {
  customerId: string | null;
  subscriptionId: string | null;
  variantId: string | null;
  status: SubscriptionStatus;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
}

// 积分信息
export interface CreditInfo {
  freeTotal: number;
  freeUsed: number;
  freeRemaining: number;
  isSubscribed: boolean;
  freeResetAt: string | null;
  bonusGenerations: number;
}
