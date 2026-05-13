import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AnalyticsGate } from "@/components/analytics/AnalyticsGate";
import { RefCookieSetter } from "@/components/referral/RefCookieSetter";
import { ReferralBanner } from "@/components/referral/ReferralBanner";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remixso.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "RemixSo — Stop rewriting. Start creating.",
    template: "%s — RemixSo",
  },
  description:
    "One article, every platform. RemixSo uses AI to repurpose your content for X, LinkedIn, Instagram, email, TikTok and YouTube — keeping your voice, just changing the format.",
  keywords: [
    "content repurposing",
    "AI content tool",
    "social media automation",
    "solo creator",
    "content marketing",
  ],
  openGraph: {
    title: "RemixSo — AI Content Repurposing for Solo Creators",
    description:
      "Stop rewriting. Start creating. Turn one article into platform-perfect posts in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "RemixSo",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RemixSo — Stop rewriting. Start creating.",
    description:
      "Turn one article into platform-perfect posts for X, LinkedIn, Instagram, email, TikTok and YouTube.",
    images: ["/brand/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/brand/favicon-32.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("remixso-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#0f1114")}}catch(e){}})()`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366F1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {/* 键盘用户跳过导航 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <Suspense fallback={null}>
                <ReferralBanner />
              </Suspense>
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
              <Suspense fallback={null}>
                <RefCookieSetter />
              </Suspense>
              <CookieBanner />
              <AnalyticsGate />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
