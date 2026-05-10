"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useDodoCheckout } from "@/hooks/use-dodo-checkout";
import { useRouter } from "next/navigation";

// 首页 Pricing CTA 按钮
// variant="pro" → 已登录跳 Dodo Payments Checkout，未登录跳登录
// variant="starter" → 跳 signup 或 dashboard

interface PricingCTAProps {
  variant: "starter" | "pro";
}

export function PricingCTA({ variant }: PricingCTAProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { redirectToCheckout, isLoading: checkoutLoading } =
    useDodoCheckout();
  const router = useRouter();

  const isLoading = authLoading || checkoutLoading;

  const handleClick = () => {
    if (variant === "starter") {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin");
      }
    } else {
      if (user) {
        redirectToCheckout();
      } else {
        router.push("/auth/signin");
      }
    }
  };

  if (variant === "starter") {
    return (
      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-full border-[var(--outline-variant)]/50 hover:bg-[var(--surface-container)] glow-purple-sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        Start for free
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] glow-purple-sm"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          Start 7-Day Free Trial
          <ArrowRight size={16} className="ml-2" />
        </>
      )}
    </Button>
  );
}
