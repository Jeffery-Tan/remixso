import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// 只保护需要登录的路由
export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
