"use client";

import { Suspense, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// 登录页 —— Google OAuth + Email (Magic Link / Password)

function SignInContent() {
  const [mode, setMode] = useState<"magic" | "password">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Magic Link
  const handleSendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  // Email + Password
  const handlePasswordAuth = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        // 自动兑换邀请码（email+password 登录不走 callback，需客户端处理）
        const refCode = getCookie("remixso-ref");
        let refParam = "";
        if (refCode) {
          try {
            const res = await fetch("/api/referral/apply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: refCode }),
            });
            const data = await res.json();
            refParam = data.bonusAwarded ? "?ref_applied=3" : "?ref_applied=0";
            deleteCookie("remixso-ref");
          } catch {
            deleteCookie("remixso-ref");
          }
        }
        window.location.href = "/dashboard" + refParam;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "magic") {
      handleSendLink();
    } else {
      handlePasswordAuth();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto text-center space-y-6">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 font-semibold text-xl" aria-label="RemixSo — Home">
          <svg width="32" height="32" viewBox="0 0 1024 1024" fill="none" aria-hidden="true">
            <polygon points="340,390 340,650 530,520" className="fill-[var(--foreground)]" />
            <polygon points="320,372 320,632 510,502" className="fill-[var(--surface-bright)] stroke-[var(--foreground)]" strokeWidth="14" strokeLinejoin="round"/>
            <path d="M 60 502 L 310 502" className="stroke-[var(--foreground)]" strokeWidth="24" strokeLinecap="round"/>
            <path d="M 60 502 L 310 502" className="stroke-[var(--surface-bright)] dark:stroke-[var(--surface-container-lowest)]" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 465 438 C 580 400, 720 260, 880 200" stroke="#FF3860" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 478 456 C 600 430, 740 320, 900 290" stroke="#FF6B00" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 488 476 C 610 460, 750 400, 920 400" stroke="#FFD600" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 488 508 C 610 530, 750 502, 910 530" stroke="#00E676" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 478 535 C 600 560, 740 610, 890 650" stroke="#2979FF" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 465 555 C 580 590, 720 700, 870 760" stroke="#D500F9" strokeWidth="18" strokeLinecap="round" fill="none"/>
            <circle cx="310" cy="502" r="10" className="fill-[var(--foreground)]" />
          </svg>
          <span className="flex items-baseline">
            <span className="font-extrabold text-[var(--foreground)]">Remix</span>
            <span className="font-normal text-[var(--primary)]">So</span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold">
          {isSignUp && mode === "password" ? "Create account" : "Sign in to RemixSo"}
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Get 5 free generations per month.
        </p>

        {/* Google */}
        <GoogleSignInButton />

        {/* 分隔线 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--outline-variant)]/50" />
          <span className="text-xs text-[var(--muted-foreground)]">or</span>
          <div className="flex-1 h-px bg-[var(--outline-variant)]/50" />
        </div>

        {/* Sent confirmation */}
        {sent ? (
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-400">
            {isSignUp
              ? "Check your inbox to confirm your email."
              : "Link sent! Check your inbox for "}
            <strong>{email}</strong>
          </div>
        ) : (
          <>
            {/* Mode tabs */}
            <div className="flex rounded-full bg-[var(--surface-container)] p-0.5">
              <button
                type="button"
                onClick={() => { setMode("password"); setIsSignUp(false); }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                  mode === "password"
                    ? "bg-[var(--surface-bright)] shadow-sm text-[var(--foreground)]"
                    : "text-[var(--on-surface-variant)]"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setMode("magic")}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                  mode === "magic"
                    ? "bg-[var(--surface-bright)] shadow-sm text-[var(--foreground)]"
                    : "text-[var(--on-surface-variant)]"
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2.5 text-sm placeholder:text-[var(--on-surface-variant)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all"
              />
              {mode === "password" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-[var(--outline-variant)]/60 bg-[var(--surface-container-lowest)] px-4 py-2.5 text-sm placeholder:text-[var(--on-surface-variant)]/50 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] transition-all"
                />
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim() || (mode === "password" && !password)}
                className="w-full rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm py-2.5 disabled:opacity-50 transition-all"
              >
                {loading
                  ? "Please wait..."
                  : mode === "magic"
                    ? "Send Magic Link"
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
              </button>
            </form>

            {/* Sign up / Sign in toggle */}
            {mode === "password" && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-[var(--primary)] font-medium hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
          </>
        )}

        <p className="text-xs text-[var(--muted-foreground)]">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <SignInContent />
    </Suspense>
  );
}
