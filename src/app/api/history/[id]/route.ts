import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// DELETE /api/history/[id] —— 删除一条生成历史

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 验证所有权后再删除
    const { data: existing } = await supabase
      .from("generations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 用 service client 删除，绕过 RLS（generations 缺少 DELETE policy）
    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from("generations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("/api/history/[id] delete error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/history/[id] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
