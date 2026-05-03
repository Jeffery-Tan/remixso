import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// middleware 专用的 Supabase 客户端 + session 刷新逻辑

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // 刷新 session，如果过期则自动续期
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未登录用户重定向到登录页
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
