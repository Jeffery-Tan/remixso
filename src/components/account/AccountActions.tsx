"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

// 账号页的 Stripe 操作按钮

export function SubscribeButton() {
  const { redirectToCheckout, isLoading } = useStripeCheckout();

  return (
    <Button
      onClick={redirectToCheckout}
      disabled={isLoading}
      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] glow-purple-sm uppercase tracking-wider text-xs font-semibold whitespace-nowrap shrink-0"
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Redirecting...
        </>
      ) : (
        "Subscribe"
      )}
    </Button>
  );
}

export function ManageSubscriptionButton() {
  const { redirectToPortal, isLoading } = useStripeCheckout();

  return (
    <Button
      variant="outline"
      onClick={redirectToPortal}
      disabled={isLoading}
      className="border-[var(--outline-variant)] uppercase tracking-wider text-xs font-semibold whitespace-nowrap shrink-0"
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Loading...
        </>
      ) : (
        "Manage"
      )}
    </Button>
  );
}
