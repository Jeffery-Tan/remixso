"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface ReferralStats {
  referralCode: string | null;
  totalInvited: number;
  totalBonus: number;
  isReferred: boolean;
  referredBy: { name: string } | null;
}

export function ReferralCard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/referral/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.isReferred) setApplied(true);
      }
    } catch {
      // 静默降级
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/referral/generate-code", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStats((prev) =>
          prev ? { ...prev, referralCode: data.referralCode } : null
        );
        addToast("Invite code generated!", "success");
      }
    } catch {
      addToast("Failed to generate code", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(`${label} copied`, "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleApply = async () => {
    const code = applyCode.trim();
    if (!code) return;

    setApplying(true);
    try {
      const res = await fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.ok && data.bonusAwarded) {
        setApplied(true);
        setApplyCode("");
        addToast(
          `You got ${data.bonusAwarded} extra free generations from ${data.referrerName}!`,
          "success"
        );
        fetchStats();
      } else if (data.code === "ALREADY_REFERRED") {
        setApplied(true);
        addToast("You've already been referred.", "info");
      } else if (data.code === "SELF_REFERRAL") {
        addToast("You can't use your own code. Share it with others!", "error");
      } else if (data.code === "INVALID_CODE") {
        addToast("Invalid invite code. Check and try again.", "error");
      } else {
        addToast(data.error ?? "Something went wrong", "error");
      }
    } catch {
      addToast("Failed to apply code", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleShareToX = () => {
    if (!stats?.referralCode) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remixso.vercel.app";
    const link = `${appUrl}?ref=${stats.referralCode}`;
    const text = `I'm using RemixSo to turn one article into 6 platform-perfect posts with AI. Use my invite link for 3 free extra generations: ${link}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div className="glass-card-strong rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-[var(--outline-variant)]/20 rounded" />
          <div className="h-10 bg-[var(--outline-variant)]/20 rounded" />
        </div>
      </div>
    );
  }

  const referralLink = stats?.referralCode
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://remixso.vercel.app"}?ref=${stats.referralCode}`
    : "";

  return (
    <div className="glass-card-strong rounded-2xl p-8 space-y-8">
      {/* 区块 1：我的邀请码 */}
      <section>
        <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold mb-3">
          Invite & Earn
        </h2>
        <p className="text-sm text-[var(--on-surface-variant)] mb-4">
          Share your invite link. When someone joins with it, you both get{" "}
          <strong>+3 free generations</strong> — forever.
        </p>

        {stats?.referralCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2.5 font-mono text-lg tracking-widest text-center select-all">
                {stats.referralCode}
              </code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(stats.referralCode!, "Code")}
              >
                Copy Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(referralLink, "Link")}
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareToX}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleGenerateCode}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Invite Code"}
          </Button>
        )}
      </section>

      <hr className="border-[var(--outline-variant)]/20" />

      {/* 区块 2：兑换邀请码 */}
      <section>
        <h3 className="font-semibold text-sm mb-3">Have an invite code?</h3>

        {applied ? (
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Redeemed
            </Badge>
            {stats?.referredBy && (
              <span className="text-sm text-[var(--on-surface-variant)]">
                Invited by {stats.referredBy.name}
              </span>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter invite code"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2 text-sm placeholder:text-[var(--on-surface-variant)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all"
            />
            <Button
              variant="outline"
              onClick={handleApply}
              disabled={applying || !applyCode.trim()}
            >
              {applying ? "..." : "Redeem"}
            </Button>
          </div>
        )}
      </section>

      {/* 区块 3：邀请统计 */}
      {stats && (stats.totalInvited > 0 || stats.totalBonus > 0) && (
        <>
          <hr className="border-[var(--outline-variant)]/20" />
          <section>
            <h3 className="font-semibold text-sm mb-3">Your Impact</h3>
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)]/60 p-4 text-center">
                <div className="font-[family-name:var(--font-headline)] text-2xl font-bold">
                  {stats.totalInvited}
                </div>
                <div className="text-xs text-[var(--on-surface-variant)] mt-1">
                  {stats.totalInvited === 1 ? "Person" : "People"} Invited
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-lowest)]/60 p-4 text-center">
                <div className="font-[family-name:var(--font-headline)] text-2xl font-bold">
                  +{stats.totalBonus}
                </div>
                <div className="text-xs text-[var(--on-surface-variant)] mt-1">
                  Bonus Earned
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
