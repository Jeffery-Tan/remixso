"use client";

import { useEffect, useState } from "react";

// 付款成功后自动从 Stripe 同步订阅状态
// 页面加载时调一次 /api/sync-subscription，然后刷新页面

export function CheckoutSuccessSync() {
  const [status, setStatus] = useState<"syncing" | "done" | "error">(
    "syncing"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/sync-subscription", {
          method: "POST",
        });
        const data = await res.json();
        if (res.ok && data.synced) {
          window.location.replace("/account");
        } else {
          const reason = data.reason || data.error || `HTTP ${res.status}`;
          const detail = data.detail ? ` [${data.detail}]` : "";
          const steps = data.steps ? ` | Steps: ${data.steps.join(" → ")}` : "";
          console.warn("Sync failed:", reason, data);
          setErrorMsg(reason + detail + steps);
          setStatus("error");
        }
      } catch (err) {
        setErrorMsg(String(err));
        setStatus("error");
      }
    };
    sync();
  }, []);

  if (status === "syncing") {
    return (
      <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-700">
          Syncing your subscription status from Stripe...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 space-y-1">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Sync failed
        </p>
        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400 break-all">{errorMsg}</p>
        )}
      </div>
    );
  }

  return null;
}
