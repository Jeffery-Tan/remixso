import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCreditInfo } from "@/lib/credit-manager";

// GET /api/user/credits —— 返回当前用户的积分和订阅状态

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 尝试从 cookie 获取匿名 session
    const sessionId = request.cookies.get("anon_session")?.value ?? null;

    const credits = await getCreditInfo(user?.id ?? null, sessionId);

    return NextResponse.json(credits);
  } catch (err) {
    console.error("/api/user/credits error:", err);
    return NextResponse.json(
      { error: "Failed to fetch credits", code: "UNAUTHORIZED" },
      { status: 500 }
    );
  }
}
