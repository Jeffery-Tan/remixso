"use client";

import { useState } from "react";

// Dodo Payments Checkout / Cancel 客户端 hook
// 封装 API 调用和页面跳转逻辑

export function useLemonCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const redirectToCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout session");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }
      // 取消了订阅，刷新页面更新 UI
      window.location.reload();
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { redirectToCheckout, cancelSubscription, isLoading };
}
