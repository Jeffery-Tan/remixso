"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const CONSENT_KEY = "remixso-cookie-consent";

function getConsent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.choice ?? null;
  } catch {
    return null;
  }
}

export function AnalyticsGate() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(getConsent());

    function onConsentChange() {
      setConsent(getConsent());
    }

    window.addEventListener("cookie-consent-changed", onConsentChange);
    return () => window.removeEventListener("cookie-consent-changed", onConsentChange);
  }, []);

  // 只有用户明确选 "all" 才加载分析脚本（GDPR 要求）
  if (consent !== "all") return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
