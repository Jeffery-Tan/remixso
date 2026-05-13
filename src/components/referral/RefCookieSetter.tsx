"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// 检测 ?ref= 参数，写入 cookie 供后续 auth flow 使用
// 无 UI，纯副作用组件

export function RefCookieSetter() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !ref) return;
    done.current = true;

    // 设置 cookie，1 小时过期，path=/
    document.cookie = `remixso-ref=${encodeURIComponent(ref)}; path=/; max-age=3600; SameSite=Lax`;
  }, [ref]);

  return null;
}
