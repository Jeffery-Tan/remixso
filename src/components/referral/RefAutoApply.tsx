"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";

// 已登录用户访问邀请链接时，自动兑换邀请码

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function RefAutoApply() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !user) return;

    const refCode = getCookie("remixso-ref");
    if (!refCode) return;

    applied.current = true;

    fetch("/api/referral/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: refCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        deleteCookie("remixso-ref");

        if (data.bonusAwarded) {
          addToast(
            `You got ${data.bonusAwarded} extra free generations from ${data.referrerName}!`,
            "success"
          );
        } else if (data.code === "ALREADY_REFERRED" || data.code === "SELF_REFERRAL") {
          addToast(
            "You've already been referred. Invite others to earn more free generations on your Account page.",
            "info"
          );
        }
      })
      .catch(() => {
        deleteCookie("remixso-ref");
      });
  }, [user, addToast]);

  return null;
}
