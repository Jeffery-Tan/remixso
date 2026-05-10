"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Dialog } from "@/components/ui/Dialog";
import { useDodoCheckout } from "@/hooks/use-dodo-checkout";

// 账号页的 Dodo Payments 操作按钮

export function SubscribeButton() {
  const { redirectToCheckout, isLoading } = useDodoCheckout();

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

export function CancelSubscriptionButton({
  isTrialing,
}: {
  isTrialing?: boolean;
}) {
  const { cancelSubscription, isLoading } = useDodoCheckout();
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
        description={
          isTrialing
            ? "If you cancel during the trial, you will not be eligible for a 7-day free trial if you subscribe again."
            : "Your subscription will remain active until the end of the current billing period. You won't be charged again."
        }
      >
        {isTrialing && (
          <p className="text-sm text-amber-600 bg-amber-500/10 rounded-lg px-4 py-3 mt-2">
            This means your next subscription will be charged immediately at $19/month with no trial period.
          </p>
        )}
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
