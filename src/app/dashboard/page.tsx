"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Workspace } from "@/components/dashboard/Workspace";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "history">("workspace");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const showed = useRef(false);

  useEffect(() => {
    if (showed.current) return;
    const refApplied = searchParams.get("ref_applied");
    if (!refApplied) return;
    showed.current = true;

    if (refApplied !== "0") {
      addToast(`You got ${refApplied} extra free generations! Invite others to earn more.`, "success");
    } else {
      addToast("You've already been referred. Visit the Account page to invite others and earn more free generations!", "info");
    }

    // 清除 URL 参数
    const params = new URLSearchParams(searchParams.toString());
    params.delete("ref_applied");
    const newUrl = params.toString()
      ? `/dashboard?${params.toString()}`
      : "/dashboard";
    router.replace(newUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-[calc(100vh-3.5rem)] relative">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block h-full">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* 移动端侧边栏 + 遮罩 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--foreground)]/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 w-56 md:hidden">
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* 移动端粘性顶栏 */}
        <div className="sticky top-0 z-20 flex md:hidden items-center gap-3 px-4 py-3 bg-[var(--surface-container-lowest)]/80 backdrop-blur-xl border-b border-[var(--outline-variant)]/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {activeTab === "workspace" ? "Workspace" : "History"}
          </span>
        </div>

        {activeTab === "workspace" ? (
          <Workspace />
        ) : (
          <HistoryPanel onLoadEntry={() => setActiveTab("workspace")} />
        )}
      </main>
    </div>
  );
}
