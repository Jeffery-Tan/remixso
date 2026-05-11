# Stitch Design Prompt

You are designing UI for an EXISTING, fully-built web application. Do NOT invent new features, pages, copy, or user flows. Your only job is visual design: layout, spacing, typography, color application, and component polish.

---

## Hard Constraints (DO NOT break these)

1. **No new features.** If something isn't listed below, it doesn't exist in the app. Don't add it.
2. **No new copy.** Every headline, label, button text, and description is already written. Use them verbatim — don't rewrite, don't add marketing fluff.
3. **4 pages only.** Home (/), Product (/product), Dashboard (/dashboard), Account (/account). No extra pages.
4. **Fixed design tokens.** Colors, fonts, border-radius are locked — see below. Use them, don't invent alternatives.

---

## Design Tokens

```
Primary:           #7c3aed
Primary Hover:     #6d28d9
Background:        #ffffff
Foreground:        #171717
Muted BG:          #f5f5f5
Muted Foreground:  #737373
Border:            #e5e5e5
Focus Ring:        #7c3aed
Error:             #ef4444

Font Sans:  Geist Sans, system-ui, sans-serif
Font Mono:  Geist Mono, monospace

Border Radius: 8px (buttons, cards, inputs), 12px (dialogs)
```

Light mode only. Brand color is purple (#7c3aed). The app aims for clean and minimal, but currently feels too grey/white — the purple brand color is underused visually.

---

## Page 1: Home `/`

**Header** — Sticky, frosted glass background. Logo "✦ RemixSo" + "Product" link + "Dashboard" link (logged in) + credit badge (logged in) + avatar / "Sign in" button.

**Hero** — Centered, max-width ~720px.

- Badge: "For solo creators" (outline style)
- H1: "Stop rewriting. Start creating." (split across two lines visually, not copy)
- Subtitle: "Turn one article into platform-perfect posts for X, LinkedIn, Instagram, email, TikTok and YouTube Shorts — keeping your voice, just changing the format."
- Inline demo area: textarea + "Generate Now" button. Below the demo: "1 free generation · no credit card required" in small muted text.

**Platform Grid** — Section with muted background. Title "6 platforms. One click." + subtitle "Your content, perfectly formatted for every platform." Below: 2×3 or 6-column grid of cards, each showing icon + platform name. 6 platforms: X/Twitter, LinkedIn, Instagram, Newsletter, TikTok, YouTube Shorts.

**How It Works** — 3-step flow: "1. Paste" → "2. Analyze" → "3. Generate". Each step has a title and one-line description. Below the steps, show a 3-column preview of outputs (one per platform format) to demonstrate the result.

**Feature Cards** — 3 cards in a row:

1. "Keep Your Voice" — AI analyzes your writing style first, then rewrites in your voice — not generic AI-speak.
2. "One Click, Six Platforms" — Paste once, get perfectly formatted posts for every major creator platform.
3. "Edit Before You Post" — Fine-tune any output with simple instructions — 'make it shorter', 'add a hook'.

**Pricing** — Single card, purple border highlight. Badge "Pro Plan", price "$19/mo", subtitle "7 days free trial · Cancel anytime". 5 feature bullets with check/zap icons. CTA button at bottom.

**FAQ** — 5 collapsible Q&A items using `<details>` / accordion pattern. Divider lines between items.

**Footer** — "© 2026 RemixSo" · "Product" · "Built for creators". Simple, top-border divider.

---

## Page 2: Product `/product`

**Hero** — Badge "How it works" + title "Your content, everywhere." + subtitle about the flow.

**4-Step Flow** — Numbered circles connected by a line/arrow:

1. "Paste or URL" — Drop in your blog post, article, or any long-form text.
2. "Analyze Voice" — Our AI learns your writing style — tone, pacing, vocabulary.
3. "Generate" — Get platform-perfect posts in seconds, all keeping your voice.
4. "Refine & Share" — Quick-edit any output, copy, export, and publish.

**Platform Showcase** — Tabs for each of the 6 platforms. Each tab shows a Before/After side-by-side comparison (Input left, Output right).

**Bottom CTA** — "Ready to stop rewriting?" + "Paste your first article and see the magic." + "Try it free" button.

---

## Page 3: Dashboard `/dashboard` (core workspace)

This is the main interaction page. It has many states — design each one.

**Top Bar** — "Dashboard" title + CreditBadge (shows "Pro — unlimited" or "N free left").

**Trial Banner (conditional)** — For anonymous users: "Free preview (1 generation). Sign in to get 5 free per month." For exhausted users: "You're out of free generations. Upgrade to Pro."

### States

**A. Empty/Idle State** — Centered illustration/icon + "Ready to remix your content?" + subtitle. Below: 4 quick-fill suggestion chips ("article", "blog post", "newsletter", "essay").

**B. Input Area** — Two-tab toggle: "Paste text" | "Paste URL".

- *Text mode:* Title input (optional) + large textarea with "Paste your article, blog post, or any long-form content here..." placeholder + character counter "N / 5,000" bottom-right.
- *URL mode:* URL input with "https://your-blog-post.com/article" placeholder + "Fetch content" button. States: idle → fetching (spinner + "Fetching...") → success (content preview) → error (red message).

**C. Platform Selector** — "Select platforms" label + 6-platform grid (multi-select checkboxes). Each card shows platform name + short description. Selected state: purple border. Platforms:

- X / Twitter Thread: "5-12 tweet thread with hook and CTA"
- LinkedIn Post: "800-1,200 char professional post"
- Instagram Caption: "120-700 char engaging caption"
- Email Newsletter: "200-500 word personal email"
- TikTok Caption: "100-300 char casual caption"
- YouTube Shorts: "50-70 char clickable title"

**D. Generate Button** — Full-width "Generate" button. After generation: shows "New" + "Regenerate" buttons.

**E. Progress States:**

- Analyzing: Spinner + "Analyzing your writing voice..." + "Understanding tone, pacing, and signature style"
- Generating: Spinner + "Generating N platforms in parallel" + list of platform names
- Error: Red error banner
- Partial failure: Yellow warning "Some platforms failed to generate:" + platform names

**F. Results (done state)** — Platform tabs across the top. Each tab shows an OutputCard with: generated content, word count, "edited" indicator, Copy button, Refine button. Export bar above/below: "Export:" + "Copy all" / "Markdown" / "JSON" buttons.

**G. Refine Drawer** — Slides in from right, partial overlay. Title "Refine [platform name]". Shows: current version preview + "What would you like to change?" label + instruction input (placeholder: 'e.g. "Make it more casual", "Shorten to 100 words", "Add a question at the end"') + Cancel / Apply buttons. Apply shows spinner "Refining...".

**H. "New" Confirmation Dialog** — Centered modal with overlay. Title "Discard results?" + "This will clear all generated content. This action cannot be undone." + Cancel / Discard buttons.

---

## Page 4: Account `/account`

**Header** — "Account" title.

**Subscription Card** — "Subscription" + "Manage your plan and billing" subtitle.

States:

- **Unsubscribed:** Plan name "RemixSo Pro" + "Inactive" badge + "$19/month · 7-day free trial · Cancel anytime" + "Subscribe to Pro" button.
- **Trial:** "RemixSo Pro" + "Trial Active" badge + "$19/month · Trial ends [date]" + "N days left in trial" + "Manage Subscription" button.
- **Active:** "RemixSo Pro" + "Active" badge + "$19/month · Next billing [date]" + "Manage Subscription" button.

**Usage Card** (right side) — "Usage" + "This month's activity".

- Free users: progress bar "N / 5" + "Free remaining"
- Pro users: "Unlimited generations with Pro"

**Success Callback** — When URL has `?checkout=success`: banner "Syncing your subscription status..." (auto-refreshes). Error state: "Sync failed" + error detail.

**Loading State** — Skeleton screen (pulsing placeholder blocks).

---

## UI Components (for reference)

These already exist in code. Design them consistently:

- **Button:** variants: default (purple fill), outline, ghost. Sizes: sm, default, lg. States: default, hover, disabled, loading (spinner + muted).
- **Textarea:** default, disabled, character counter.
- **Card:** white bg, rounded-lg, subtle shadow + border.
- **Badge:** variants: default (purple fill), success (green), outline.
- **Spinner:** rotating animation.
- **Skeleton:** pulsing placeholder.
- **Tabs:** horizontal tab bar + underline indicator on active tab.
- **Toast:** bottom-right corner, types: info/success/error. Auto-dismiss after ~4 seconds.
- **Dialog:** centered modal + dark overlay backdrop.

---

## What You SHOULD Do

- Apply the purple brand color more confidently — it's currently too timid
- Improve visual hierarchy and spacing rhythm between sections
- Make the Dashboard empty state more inviting
- Design mobile-responsive layouts (not just desktop grid shrink)
- Polish the refine drawer and tab transitions
- Make the Before/After comparison on the Product page visually compelling
- Use the muted background sections to create visual rhythm (alternating white/grey)

## What You MUST NOT Do

- Add pages (no /blog, /pricing, /about, /features, /contact, etc.)
- Add features (no team plans, no analytics, no scheduling, no integrations panel, no dark mode toggle, no notification bell, no onboarding wizard, etc.)
- Rewrite copy (don't change headlines, don't add taglines, don't invent new marketing text)
- Change the pricing ($19/mo is fixed)
- Add new UI components beyond the 10 listed above
- Add social proof sections (testimonials, logos, user counts, star ratings)
- Add email capture or newsletter signup forms

If you're unsure whether something should exist, default to NOT including it.
