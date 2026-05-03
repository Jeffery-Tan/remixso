import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Dashboard 布局 —— 服务端组件，确保已登录
// middleware 已拦截未登录用户，这里做双重检查

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
