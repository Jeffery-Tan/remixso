import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/history —— 返回当前用户的生成历史

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: generations, error } = await supabase
      .from("generations")
      .select("*, platform_outputs(platform, generated_content)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("/api/history query error:", error);
      throw error;
    }

    const entries = (generations ?? []).map((g: Record<string, unknown>) => {
      const outputs = g.platform_outputs as Array<{
        platform: string;
        generated_content: string;
      }> | null;
      return {
        id: g.id,
        sourceType: g.source_type,
        sourceContent: g.source_content,
        sourceTitle: g.source_title,
        sourceUrl: g.source_url,
        platforms: g.platforms,
        totalTokensUsed: g.total_tokens_used,
        processingMs: g.processing_ms,
        createdAt: g.created_at,
        outputs: (outputs ?? []).map((o) => ({
          platform: o.platform,
          content: o.generated_content,
        })),
      };
    });

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("/api/history error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
