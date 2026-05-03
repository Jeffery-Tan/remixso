"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Sparkles } from "lucide-react";

export function HomeDemo() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      sessionStorage.setItem("remixso_draft", text.trim());

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/dashboard");
      } else {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div>
      <Textarea
        placeholder="Paste your blog post or article here... (free, no sign-up)"
        className="min-h-[140px] text-left border-none bg-transparent focus-visible:ring-0 resize-none placeholder:text-[var(--on-surface-variant)]/40 font-light"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <span className="text-xs sm:text-sm text-[var(--on-surface-variant)]/60 font-light tracking-wide text-center sm:text-left">
          1 free generation · no credit card required
        </span>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full sm:w-auto rounded-full bg-[var(--primary)]/10 backdrop-blur-md border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all uppercase tracking-widest text-xs font-semibold"
        >
          <Sparkles size={14} className="mr-2" />
          {loading ? "Redirecting..." : "Generate Now"}
        </Button>
      </div>
    </div>
  );
}
