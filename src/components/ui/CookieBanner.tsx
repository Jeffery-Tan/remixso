"use client";

import { useState, useEffect } from "react";

type ConsentChoice = "all" | "essential";

const CONSENT_KEY = "remixso-cookie-consent";
const CONSENT_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

// GDPR-compliant dual-button cookie banner
// Requires explicit choice before closing — no implied consent

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const ts = Number(data.ts);
        if (Date.now() - ts < CONSENT_TTL_MS) {
          applyConsent(data.choice);
          return;
        }
      } catch {
        // Corrupted data, re-ask
      }
    }
    setVisible(true);
  }, []);

  const applyConsent = (choice: ConsentChoice) => {
    if (choice === "essential") {
      // Only allow functional cookies (auth, payments)
      // Analytics scripts blocked via AnalyticsGate
    }
    // "all" — analytics enabled
    window.dispatchEvent(new CustomEvent("cookie-consent-changed"));
  };

  const handleChoice = (c: ConsentChoice) => {
    applyConsent(c);
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: c, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-50 motion-safe:animate-slide-up">
      <div role="dialog" aria-label="Cookie consent" className="bg-[var(--surface-bright)] border border-[var(--outline-variant)]/40 rounded-2xl shadow-lg px-5 py-4">
        <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed mb-4">
          This site uses functional cookies for authentication and payments, and
          optional analytics cookies to improve the service. See our{" "}
          <a href="/privacy" className="underline text-[var(--primary)]">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/cookie-policy" className="underline text-[var(--primary)]">
            Cookie Policy
          </a>
          .
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => handleChoice("essential")}
            className="flex-1 cursor-pointer rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-xs font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleChoice("all")}
            className="flex-1 cursor-pointer rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
