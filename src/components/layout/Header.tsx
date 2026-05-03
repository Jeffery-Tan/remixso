"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Container } from "./Container";
import { Button } from "../ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Menu, X, Sun, Moon } from "lucide-react";

export function Header() {
  const { user, profile, credits, isLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!user;
  const userAvatar = profile?.avatarUrl ?? null;
  const isSubscribed = credits?.isSubscribed ?? false;
  const creditsRemaining = credits?.freeRemaining;

  // 点击外部关闭用户菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // 移动端菜单打开时禁止滚动
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // 首页 section 高亮 —— IntersectionObserver
  useEffect(() => {
    if (!isHome) return;
    const sectionIds = ["product", "demo", "pricing", "faq"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, pathname]);

  const navLinkClass = (section: string) =>
    isHome && activeSection === section
      ? "text-[var(--primary)] font-semibold"
      : "text-[var(--on-surface-variant)] hover:text-[var(--primary)]";

  return (
    <header className="sticky top-0 z-30 border-b-2 border-[var(--outline)]/20 bg-[var(--surface-bright)]/70 dark:bg-[var(--surface-container-lowest)]/80 backdrop-blur-xl shadow-[0_4px_0_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_-2px_rgba(0,0,0,0.2)]">
      <Container>
        <nav className="flex h-14 items-center gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-[family-name:var(--font-headline)] font-bold text-lg tracking-tight shrink-0"
            aria-label="RemixSo — Home"
          >
            {/* 棱镜图标 */}
            <svg width="28" height="28" viewBox="0 0 1024 1024" fill="none" aria-hidden="true">
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
            {/* 字标 */}
            <span className="flex items-baseline">
              <span className="font-extrabold text-[var(--foreground)]">Remix</span>
              <span className="font-normal text-[var(--primary)]">So</span>
            </span>
          </Link>

          {/* 桌面端 Nav links */}
          <div className="hidden sm:flex items-center gap-6 ml-8">
            <Link href="/#product" className={`text-sm transition-colors duration-200 ${navLinkClass("product")}`}>Product</Link>
            <Link href="/#demo" className={`text-sm transition-colors duration-200 ${navLinkClass("demo")}`}>Demo</Link>
            <Link href="/#pricing" className={`text-sm transition-colors duration-200 ${navLinkClass("pricing")}`}>Pricing</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors duration-200">Dashboard</Link>
            )}
          </div>

          {/* 右侧：桌面端 Auth + 主题切换 + 移动端汉堡 */}
          <div className="flex items-center gap-3 ml-auto">
            {/* 桌面端 Auth */}
            <div className="hidden sm:flex items-center gap-3">
              {isLoading ? (
                <div className="h-8 w-16 rounded bg-[var(--surface-container)] animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {/* 积分徽章 */}
                  {creditsRemaining !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border-2 transition-colors ${
                        isSubscribed
                          ? "bg-[var(--foreground)] text-[var(--surface)] border-[var(--foreground)] shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]"
                          : creditsRemaining <= 1
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 shadow-[2px_2px_0_0_rgba(251,191,36,0.2)]"
                            : "bg-[var(--surface-bright)] text-[var(--foreground)] border-[var(--outline)] shadow-[2px_2px_0_0_rgba(0,0,0,0.08)] dark:shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSubscribed
                            ? "bg-green-400"
                            : creditsRemaining <= 1
                              ? "bg-amber-500"
                              : "bg-[var(--primary)]"
                        }`}
                      />
                      {isSubscribed ? "Pro" : `${creditsRemaining} free`}
                    </span>
                  )}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="cursor-pointer"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="menu"
                    >
                      {userAvatar && !imgError ? (
                        <img
                          src={userAvatar}
                          alt="Avatar"
                          className="h-8 w-8 rounded-full border-2 border-[var(--outline-variant)]/40 hover:border-[var(--primary)]/60 transition-colors"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-medium border-2 border-[var(--primary)] hover:shadow-[2px_2px_0_0_rgba(99,102,241,0.25)] transition-shadow">
                          {profile?.fullName?.[0] ??
                            profile?.email?.[0]?.toUpperCase() ??
                            "U"}
                        </div>
                      )}
                    </button>

                    {userMenuOpen && (
                      <div role="menu" className="absolute right-0 top-full mt-2 w-44 rounded-xl border-2 border-[var(--outline)]/20 bg-[var(--surface-bright)] shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] py-1.5 z-40">
                        <Link
                          href="/account"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--foreground)] transition-colors"
                        >
                          Account
                        </Link>
                        <div className="border-t border-[var(--outline-variant)]/10 my-1" />
                        <button
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--on-surface-variant)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button variant="primary" size="sm" className="rounded-full">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>

            {/* 深色模式切换 */}
            <button
              onClick={toggleTheme}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 移动端汉堡按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden cursor-pointer p-1.5 -mr-1.5 rounded-lg hover:bg-[var(--surface-container)] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* 移动端滑出菜单 —— Portal 到 body，彻底脱离父级样式 */}
        {mobileMenuOpen &&
          createPortal(
            <div
              ref={mobileMenuRef}
              className="sm:hidden fixed inset-0 top-14 z-50"
              style={{ backgroundColor: theme === "dark" ? "#2c3038" : "#ffffff" }}
            >
              <div className="flex flex-col gap-1 p-4 pt-6">
                <Link href="/#product" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors ${isHome && activeSection === "product" ? "text-[var(--primary)] bg-[var(--primary)]/5" : "hover:bg-[var(--surface-container)]"}`}>Product</Link>
                <Link href="/#demo" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors ${isHome && activeSection === "demo" ? "text-[var(--primary)] bg-[var(--primary)]/5" : "hover:bg-[var(--surface-container)]"}`}>Demo</Link>
                <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors ${isHome && activeSection === "pricing" ? "text-[var(--primary)] bg-[var(--primary)]/5" : "hover:bg-[var(--surface-container)]"}`}>Pricing</Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium py-3 px-4 rounded-xl hover:bg-[var(--surface-container)] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium py-3 px-4 rounded-xl hover:bg-[var(--surface-container)] transition-colors"
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="text-lg font-medium py-3 px-4 rounded-xl text-left hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 mx-4"
                  >
                    <Button variant="primary" className="w-full rounded-full">
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </div>,
            document.body
          )}
      </Container>
    </header>
  );
}
