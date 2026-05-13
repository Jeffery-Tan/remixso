import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RefAutoApply } from "@/components/referral/RefAutoApply";

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

  return (
    <>
      <RefAutoApply />
      <Suspense fallback={null}>{children}</Suspense>
    </>
  );
}
