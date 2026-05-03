"use client";

import { useState } from "react";

// Stripe Checkout / Portal 客户端 hook
// 封装 API 调用和页面跳转逻辑

export function useStripeCheckout() {
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

  const redirectToPortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create portal session");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { redirectToCheckout, redirectToPortal, isLoading };
}
