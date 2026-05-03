"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Platform =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "newsletter"
  | "tiktok"
  | "youtube-shorts";

const platforms: { id: Platform; label: string }[] = [
  { id: "twitter", label: "X / Twitter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "newsletter", label: "Newsletter" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube-shorts", label: "YT Shorts" },
];

const beforeText = `The creator economy is evolving faster than anyone predicted. In 2026, there are over 200 million content creators worldwide, and nearly half of them work alone. These solo creators face a unique challenge: they need to maintain a presence on multiple platforms — X, LinkedIn, Instagram, email newsletters, TikTok, YouTube — but they don't have a team to help them adapt content for each channel. The result? Either they spend hours rewriting the same ideas for different formats, or they give up on platforms where they could be growing their audience.`;

const examples: Record<Platform, string> = {
  twitter: `The creator economy just crossed a threshold nobody is talking about.

200M+ creators worldwide. Nearly half work alone.

Here's the breakdown 🧵

Solo creators are expected to be everywhere — X, LinkedIn, Instagram, email, TikTok, YouTube.

But they don't have a team.

So they either:
• Spend hours rewriting for each platform
• Or give up on channels they could grow on

The real problem isn't content creation. It's content adaptation.

Same message, different language. Every platform speaks its own.

What do you use to repurpose content? 👇

#CreatorEconomy #SoloCreator`,

  linkedin: `The creator economy just crossed a threshold. 200M+ creators. Nearly half of them work alone.

And they're all facing the same invisible bottleneck.

I've been talking to solo creators, and here's what keeps coming up:

They're expected to maintain a presence everywhere — X, LinkedIn, Instagram, email, TikTok, YouTube. But without a team, adapting content for each platform becomes a second full-time job.

The result?

Most creators default to one platform. They leave audience and revenue on the table because the "content adaptation tax" is simply too high.

The solution isn't more content. It's smarter adaptation.

The same core ideas, expressed in the native language of each platform. That's the unlock.

Are you repurposing your content across platforms, or is most of your work only living on one channel?

#ContentStrategy #CreatorEconomy #SoloEntrepreneur`,

  instagram: `200 million creators. Half work alone.

But they're expected to be everywhere at once. 🤯

X. LinkedIn. Instagram. Email. TikTok. YouTube.

Without a team, adapting content for every platform eats hours of your week.

So most creators just... don't.

They pick one platform and leave audience everywhere else on the table.

Here's the truth: the problem isn't creating more content.

It's adapting what you already have.

Same message, different format.

You don't need a social media team. You need a smarter way to repurpose.

What's your biggest content bottleneck right now? 👇

Link in bio to try it free. 🔗`,

  newsletter: `Hey there,

There's a stat that stopped me in my tracks this week: 200 million content creators worldwide. Nearly half of them are solopreneurs, freelancers, and indie creators flying solo.

That's 100 million people with the same problem.

They're told they need to be everywhere — social media, email, short-form video — but nobody gave them a team to do it with.

So here's what happens: most creators pick one platform and stick with it. The Twitter person stays on Twitter. The LinkedIn person stays on LinkedIn.

It's not that they don't have more to say. It's that repurposing takes too long.

The content isn't the bottleneck. The adaptation is.

This week, try this one exercise: take your best-performing post from last month and manually rewrite it for one other platform. Pay attention to how long it takes.

Then imagine doing that for five platforms. Every week.

That's the gap.

Talk soon.`,

  tiktok: `POV: You're a solo creator expected to be on 6 platforms at once 😳

200M+ creators worldwide. Nearly half work ALONE.

No team. No assistant. Just you trying to post everywhere.

Here's what actually happens:

✖️ You rewrite the same idea 5 different ways
✖️ You spend hours formatting for each app
✖️ You burn out and stick to one platform

But here's the thing:

Your content should work FOR you across every platform.

Same ideas. Platform-native formats. Done in minutes, not hours.

What platform takes YOU the longest to create for? 👇

#CreatorLife #ContentCreator #SoloCreator`,

  "youtube-shorts": `200 Million Creators. ONE Problem.

👉 Nearly HALF work alone
👉 Expected to post on 6+ platforms
👉 No team to help adapt content

The result? Most creators stay stuck on one platform.

Your ideas deserve to be everywhere.

Why leave audience on the table?

Stop rewriting. Start creating. 🔥

#ContentCreator #YouTubeShorts`,
};

export function PlatformShowcase() {
  const [active, setActive] = useState<Platform>("twitter");

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              active === p.id
                ? "bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/20"
                : "bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Before / After */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-[var(--outline-variant)]/30">
          <Badge variant="outline" className="mb-3">
            Input
          </Badge>
          <h3 className="font-semibold mb-2">Your blog post</h3>
          <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
            {beforeText}
          </p>
        </Card>
        <Card className="border-[var(--primary)]/30 shadow-sm shadow-[var(--primary)]/5">
          <div className="flex items-center justify-between mb-3">
            <Badge>
              Output — {platforms.find((p) => p.id === active)?.label}
            </Badge>
            <span className="text-xs text-[var(--on-surface-variant)]">
              {examples[active].length.toLocaleString()} chars
            </span>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-[var(--foreground)]">
            {examples[active]}
          </pre>
        </Card>
      </div>
    </div>
  );
}
