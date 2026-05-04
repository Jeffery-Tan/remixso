"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Dialog } from "@/components/ui/Dialog";
import { useLemonCheckout } from "@/hooks/use-lemon-checkout";

// 账号页的 Dodo Payments 操作按钮

export function SubscribeButton() {
  const { redirectToCheckout, isLoading } = useLemonCheckout();

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

export function CancelSubscriptionButton() {
  const { cancelSubscription, isLoading } = useLemonCheckout();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConfirm(true)}
        className="border-red-500/50 text-red-500 hover:bg-red-500/10 uppercase tracking-wider text-xs font-semibold whitespace-nowrap shrink-0"
      >
        Cancel
      </Button>

      <Dialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Cancel Subscription"
        description="Your subscription will remain active until the end of the current billing period. You won't be charged again."
      >
        <div className="flex gap-3 justify-end mt-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Keep Subscription
          </Button>
          <Button
            onClick={async () => {
              await cancelSubscription();
              setShowConfirm(false);
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Canceling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
