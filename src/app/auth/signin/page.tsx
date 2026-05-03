"use client";

import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import Link from "next/link";

// 登录页 —— 目前只支持 Google OAuth

function SignInContent() {
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

        <h1 className="text-2xl font-bold">Sign in to RemixSo</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Get 3 free generations per month. One click sign-in with Google.
        </p>

        <GoogleSignInButton />

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
