# RemixSo 设计交接文档

> **Stitch 输出格式建议：** 页面截图（PNG/PDF）+ Stitch 分享链接。如果 Stitch 支持导出 Design Tokens（颜色/字体/间距/圆角），导出 JSON/CSS 给我最好——我可以直接映射到 Tailwind 配置。

---

## 1. 设计 Token

```css
/* 颜色 */
--primary:          #7c3aed  /* 主色：紫色 */
--primary-hover:    #6d28d9  /* hover 加深 */
--background:       #ffffff  /* 页面背景 */
--foreground:       #171717  /* 正文文字 */
--muted:            #f5f5f5  /* 次要背景 */
--muted-foreground: #737373  /* 次要文字 */
--border:           #e5e5e5  /* 边框/分割线 */
--ring:             #7c3aed  /* focus ring */
--destructive:      #ef4444  /* 错误/危险操作 */

/* 字体 */
--font-sans:  Geist Sans, system-ui, sans-serif
--font-mono:  Geist Mono, monospace

/* 圆角 */
按钮/卡片/输入框: rounded-lg（8px）
弹窗: rounded-xl（12px）
```

当前只有亮色模式。品牌色是紫色（#7c3aed），走干净简洁路线但目前的视觉承载不了这个色。

---

## 2. 页面结构

共 4 个页面 + 1 个弹窗/抽屉：

### 2.1 首页 `/`

| 区块 | 状态 | 当前内容 |
|------|------|----------|
| **Header** | 登录/未登录 | Logo + Product链接 + Dashboard(登录后) + 积分(登录后) + 头像/Sign in按钮 |
| **Hero** | 通用 | 定位语"Stop rewriting. Start creating." + 内联试用区（Textarea + Generate Now 按钮） |
| **平台展示** | 通用 | 6 个平台 icon grid（X, LinkedIn, Instagram, Newsletter, TikTok, YT Shorts） |
| **QuickDemo** | 通用 | 3 步流程卡片（1.Paste → 2.Analyze → 3.Generate）+ 3 列输出预览 |
| **Feature Grid** | 通用 | 3 个功能卡片（Keep Your Voice / One Click Six Platforms / Edit Before You Post） |
| **Pricing** | 通用 | $19/月卡片 + 7 天试用 + 5 个 feature list + CTA按钮 |
| **FAQ** | 通用 | 5 个折叠问答 |
| **Footer** | 通用 | Copyright + Product链接 + "Built for creators" |

**Pricing CTA 按钮状态：**
- 未登录 → 跳 `/auth/signin`
- 已登录未订阅 → 直接跳 Dodo Payments Checkout
- 已订阅 → 跳 `/account`（文字变为 "Manage Subscription"）

### 2.2 产品页 `/product`

| 区块 | 当前内容 |
|------|----------|
| Hero | "Your content, everywhere." + 副标题 |
| 4 步流程 | Paste or URL → Analyze Voice → Generate → Refine & Share（带编号圆点） |
| 平台展示 | 6 平台 Tab 切换 + Before/After 双栏对比（Input + Output） |
| CTA | "Ready to stop rewriting?" + "Try it free" 按钮 |

### 2.3 账户页 `/account`（需登录）

| 状态 | 内容 |
|------|------|
| **加载中** | 骨架屏（Skeleton 组件） |
| **未订阅** | Subscription 卡片显示 "RemixSo Pro" + "Inactive" badge + $19/月说明 + "Subscribe to Pro" 按钮 |
| **试用中** | "Pro" + "Trial Active" badge + 试用到期日 + 剩余天数 + "Manage Subscription" |
| **已订阅** | "Pro" + "Active" badge + 下期账单日 + "Manage Subscription" |
| **右侧用量卡片** | 未订阅显示进度条（x/5）+ "Free remaining"；已订阅显示 "Unlimited generations with Pro" |
| **付款成功回调** | `?checkout=success` 参数时显示 "Syncing..." 横幅，同步完成后自动刷新 |

**可能的错误状态：** 同步失败时显示错误信息。

### 2.4 Dashboard 工作区 `/dashboard`（需登录）

核心交互页，状态最多。

| 区块 | 状态 | 内容 |
|------|------|------|
| **顶部栏** | 通用 | "Dashboard" 标题 + CreditBadge（Pro unlimited / x free left） |
| **试用横幅** | 未订阅/匿名 | "Free preview (1 generation). Sign in to get 5." 或 "You're out of free generations. Upgrade to Pro" |
| **空白引导** | idle + 无内容时 | 编辑图标 + "Ready to remix your content?" + 4 个快速填充词（article/blog post/newsletter/essay） |
| **输入模式切换** | 通用 | "Paste text" / "Paste URL" 两个 tab |
| **文本输入** | text 模式 | Title（可选）+ 正文 Textarea（max 5000 字）+ 字数计数器 |
| **URL 输入** | url 模式 | URL 输入框 + "Fetch content" 按钮 + 抓取中 spinner + 抓取失败红色提示 + 抓取成功内容预览 |
| **平台选择** | 通用 | 6 平台网格多选（checkbox + 名称 + 描述），选中态紫色边框 |
| **Generate 按钮** | idle | 全宽大按钮 "Generate" |
| **Regenerate + New** | done | "New"（弹窗确认）+ "Regenerate" |
| **进度指示** | analyzing | Spinner + "Analyzing your writing voice..." + "Understanding tone, pacing, and signature style" |
| **进度指示** | generating | Spinner + "Generating N platforms in parallel" + 各平台名称 |
| **生成错误** | error | 红色错误横幅 |
| **部分平台失败** | done + 有错误 | 黄色警告横幅列出失败平台 |
| **导出栏** | done | "Export:" + Copy all / Markdown / JSON 按钮 |
| **结果区** | done | 平台 Tab 切换 + OutputCard（内容 + 字数 + 已编辑标记 + Copy/Refine 按钮） |
| **微调抽屉** | 点击 Refine | 右侧滑出：当前版本预览 + 指令输入框 + Cancel/Apply 按钮 + 处理中 spinner |

**New 确认弹窗：** "Discard results?" + "This will clear all generated content." + Cancel/Discard 按钮

---

## 3. UI 组件清单

| 组件 | 路径 | 变体/状态 |
|------|------|-----------|
| `Button` | `ui/Button` | variant: default/outline/ghost, size: sm/default/lg, disabled, loading |
| `Textarea` | `ui/Textarea` | default, disabled, maxLength |
| `Card` | `ui/Card` | 默认白底圆角阴影边框 |
| `Badge` | `ui/Badge` | variant: default/success/outline |
| `Spinner` | `ui/Spinner` | 旋转动画 |
| `Skeleton` | `ui/Skeleton` | 脉冲动画占位 |
| `Tabs` | `ui/Tabs` | 水平 tab 栏 + 下划线激活态 |
| `Toast` | `ui/Toast` | type: info/success/error, 右下角弹出, 4s 自动消失 |
| `Dialog` | `ui/Dialog` | 居中弹窗 + 遮罩层 |
| `Container` | `layout/Container` | max-width 容器 |
| `Header` | `layout/Header` | sticky, 毛玻璃背景 |
| `Footer` | `layout/Footer` | 底部边框线 |

---

## 4. 核心用户流程

### 4.1 匿名试用流（首页）
```
首页 Hero → 粘贴文本 → 点 "Generate Now"
  → 未登录 → Google OAuth → 回调 → /dashboard
  → 已登录 → 直接跳 /dashboard
→ Dashboard 自动填入草稿文本 → 选平台 → Generate
```

### 4.2 登录后生成流
```
Dashboard → 输入内容（文本或URL）→ 选平台 → Generate
  → "Analyzing your voice..." → "Generating N platforms in parallel"
  → 结果 Tab 展示 → 复制/微调/导出
```

### 4.3 订阅流
```
账户页 (/account) → 点击 "Subscribe to Pro"
  → Dodo Payments Checkout（$19/月，7天试用）
  → 付款成功 → 跳回 /account?checkout=success
  → 自动同步订阅 → 显示 "Trial Active"
```

### 4.4 微调流
```
Dashboard 结果 → 点某平台 "Refine"
  → 右侧抽屉滑出 → 显示当前版本 → 输入修改指令
  → Apply → Spinner → 更新结果（标记 edited）
```

---

## 5. 所有文案

### 首页
| 位置 | 文案 |
|------|------|
| Badge | "For solo creators" |
| Hero 标题 | "Stop rewriting. Start creating." |
| Hero 副标题 | "Turn one article into platform-perfect posts for X, LinkedIn, Instagram, email, TikTok and YouTube Shorts — keeping your voice, just changing the format." |
| 试用区 placeholder | "Paste your blog post or article here... (free, no sign-up)" |
| 试用区说明 | "1 free generation · no credit card required" |
| 试用区按钮 | "Generate Now" / "Redirecting..." |
| 平台展示标题 | "6 platforms. One click." |
| 平台展示副标题 | "Your content, perfectly formatted for every platform." |
| QuickDemo 标题 | "How it works" |
| QuickDemo 副标题 | "One flow. Every platform. Minutes, not hours." |
| Step 1 | "1. Paste" — "Drop your blog post, article, or any long-form text." |
| Step 2 | "2. Analyze" — "AI reads your voice — tone, pacing, signature phrases." |
| Step 3 | "3. Generate" — "Get platform-perfect posts in seconds. Every platform. Your voice." |
| 输出预览说明 | "Your content, perfectly formatted for every platform" |
| Feature 1 | "Keep Your Voice" — "Our AI analyzes your writing style first, then rewrites in your voice — not generic AI-speak." |
| Feature 2 | "One Click, Six Platforms" — "Paste once, get perfectly formatted posts for every major creator platform." |
| Feature 3 | "Edit Before You Post" — "Fine-tune any output with simple instructions — 'make it shorter', 'add a hook'." |
| Pricing Badge | "Pro Plan" |
| Pricing 价格 | "$19/mo" |
| Pricing 说明 | "7 days free trial · Cancel anytime" |
| Pricing Feature 1 | "100 content generations per month" |
| Pricing Feature 2 | "All 6 platforms included" |
| Pricing Feature 3 | "URL auto-fetch for blog posts" |
| Pricing Feature 4 | "Unlimited AI refinements" |
| Pricing Feature 5 | "Keep your unique writing voice" |
| FAQ 标题 | "FAQ" |
| FAQ Q1 | "How does the free trial work?" |
| FAQ A1 | "Start your 7-day free trial with full access to all features — no credit card required for the free generation. When you're ready to upgrade, you get 7 days to try Pro risk-free." |
| FAQ Q2 | "Can I really keep my writing voice?" |
| FAQ A2 | "Yes — our AI first analyzes your writing style (tone, pacing, vocabulary, signature phrases) and applies those patterns when generating content for each platform. The result feels like you wrote it, not an AI." |
| FAQ Q3 | "What happens to my content?" |
| FAQ A3 | "Your content is yours. We don't use your articles or posts to train AI models. We store your generations so you can access them, and you can delete them anytime." |
| FAQ Q4 | "Is there a limit on content length?" |
| FAQ A4 | "The free plan supports up to 5,000 characters per input. Pro users can paste longer content and also use URL auto-fetch for blog posts." |
| FAQ Q5 | "Can I cancel anytime?" |
| FAQ A5 | "Absolutely. Cancel with one click from your account page — no emails, no questions asked." |

### 产品页
| 位置 | 文案 |
|------|------|
| Badge | "How it works" |
| 标题 | "Your content, everywhere." |
| 副标题 | "RemixSo takes your long-form writing and turns it into platform-optimized posts — automatically. Here's what happens behind the scenes." |
| Step 1 | "Paste or URL" — "Drop in your blog post, article, or any long-form text." |
| Step 2 | "Analyze Voice" — "Our AI learns your writing style — tone, pacing, vocabulary." |
| Step 3 | "Generate" — "Get platform-perfect posts in seconds, all keeping your voice." |
| Step 4 | "Refine & Share" — "Quick-edit any output, copy, export, and publish." |
| Before/After 标题 | "See it in action" |
| CTA 标题 | "Ready to stop rewriting?" |
| CTA 副标题 | "Paste your first article and see the magic." |
| CTA 按钮 | "Try it free" |

### 账户页
| 状态 | 文案 |
|------|------|
| 页面标题 | "Account" |
| 订阅卡片标题 | "Subscription" |
| 订阅卡片副标题 | "Manage your plan and billing" |
| 未订阅名称 | "RemixSo Pro" |
| 未订阅 Badge | "Inactive" |
| 未订阅说明 | "$19/month · 7-day free trial · Cancel anytime" |
| 未订阅按钮 | "Subscribe to Pro" |
| 试用中名称 | "RemixSo Pro" |
| 试用中 Badge | "Trial Active" |
| 试用中说明 | "$19/month · Trial ends [date]" |
| 试用剩余天数 | "[N] days left in trial" |
| 已订阅 Badge | "Active" |
| 已订阅说明 | "$19/month · Next billing [date]" |
| 管理按钮 | "Manage Subscription" |
| 用量卡片标题 | "Usage" |
| 用量卡片副标题 | "This month's activity" |
| Pro 用量 | "Unlimited generations with Pro" |
| 免费用量 | "[n] / 5" + "Free remaining" |
| 同步中横幅 | "Syncing your subscription status..." |
| 同步失败 | "Sync failed" + 错误详情 |

### Dashboard
| 位置 | 文案 |
|------|------|
| 标题 | "Dashboard" |
| CreditBadge Pro | "Pro — unlimited" |
| CreditBadge 免费 | "[n] free left" |
| 试用横幅（匿名） | "Free preview (1 generation). Sign in to get 5 free per month. [Sign in]" |
| 试用横幅（用尽） | "You're out of free generations. [Upgrade to Pro for $19/month]" |
| 空白引导标题 | "Ready to remix your content?" |
| 空白引导说明 | "Paste your long-form text or a blog URL, pick your platforms, and let AI do the rest." |
| 快速填充词 | "article" / "blog post" / "newsletter" / "essay" |
| 输入 tab | "Paste text" / "Paste URL" |
| 标题 placeholder | "Title (optional)" |
| 文本 placeholder | "Paste your article, blog post, or any long-form content here... (max 5,000 characters)" |
| 字数计数 | "[n] / 5,000" |
| URL placeholder | "https://your-blog-post.com/article" |
| 抓取按钮 | "Fetch content" / "Fetching..." |
| 平台选择标题 | "Select platforms" |
| 生成按钮 | "Generate" |
| 重新生成 | "Regenerate" |
| New 按钮 | "New" |
| New 弹窗标题 | "Discard results?" |
| New 弹窗说明 | "This will clear all generated content. This action cannot be undone." |
| New 弹窗取消 | "Cancel" |
| New 弹窗确认 | "Discard" |
| 进度 - 分析 | "Analyzing your writing voice..." / "Understanding tone, pacing, and signature style" |
| 进度 - 生成 | "Generating [N] platforms in parallel" / 平台列表 |
| 部分失败横幅 | "Some platforms failed to generate:" |
| 导出栏标签 | "Export:" |
| 导出按钮 | "Copy all" / "Markdown" / "JSON" |
| 复制 Toast | "Copied to clipboard" / "All results copied" / "JSON copied" / "Markdown copied" |
| 微调抽屉标题 | "Refine [platform]" |
| 微调当前版本标签 | "Current version" |
| 微调输入标签 | "What would you like to change?" |
| 微调 placeholder | 'e.g. "Make it more casual", "Shorten to 100 words", "Add a question at the end"' |
| 微调取消 | "Cancel" |
| 微调确认 | "Apply" / "Refining..." |

### 通用
| 位置 | 文案 |
|------|------|
| Header Logo | "✦ RemixSo" |
| Header Product | "Product" |
| Header Dashboard | "Dashboard" |
| Header Sign In | "Sign in" |
| 全局错误标题 | "Something went wrong" |
| 全局错误按钮 | "Try again" |
| Footer | "© 2026 RemixSo" · "Product" · "Built for creators" |
| 产品名 | "RemixSo" |
| 定位语 | "Stop rewriting. Start creating." |
| 官网 URL | remixso.vercel.app |

### API 错误信息
| 错误码 | 用户看到的信息 |
|--------|--------------|
| CREDITS_EXHAUSTED | "No free generations remaining. Sign up or upgrade to continue." |
| RATE_LIMITED | "Too many requests. Please wait a moment." |
| INVALID_INPUT | "Content is required" / "Content exceeds 5,000 character limit" / "At least one platform is required" |
| AI_GENERATION_FAILED | "AI generation failed. Please try again." |
| URL_FETCH_FAILED | "Failed to fetch URL content" |

---

## 6. 平台描述（6 个）

| 平台 | 标签 | 简称 | 说明 | 字数限制 |
|------|------|------|------|----------|
| X / Twitter | "X / Twitter Thread" | "X" | "5-12 tweet thread with hook and CTA" | 280/条 |
| LinkedIn | "LinkedIn Post" | "LinkedIn" | "800-1,200 char professional post" | 3,000 |
| Instagram | "Instagram Caption" | "Instagram" | "120-700 char engaging caption" | 2,200 |
| Newsletter | "Email Newsletter" | "Newsletter" | "200-500 word personal email" | 5,000 |
| TikTok | "TikTok Caption" | "TikTok" | "100-300 char casual caption" | 4,000 |
| YouTube Shorts | "YouTube Shorts" | "YT Shorts" | "50-70 char clickable title" | 70 |

---

## 7. 设计下手方向

> 以下是我从代码角度观察到的痛点，供你设计时参考：

1. **首页信息层级**：Hero → 平台 icon → QuickDemo → Features → Pricing → FAQ，6 个区块堆叠，缺乏节奏感和视觉引导
2. **Dashboard 空白状态**目前只是一个居中引导语，可以更有吸引力
3. **多平台结果展示**：Tab 切换是实用的但不够直观，能否同时看到多平台输出预览再点进去看详细？
4. **微调抽屉**：全屏半遮挡，交互合理但视觉单调
5. **色彩单一**：紫色主色但使用面积很小，整体偏灰白
6. **Pricing 卡片**是唯一突出区（border-[var(--primary)]），其他区缺少视觉焦点
7. **移动端**目前是 grid 自动缩列，没有专门适配
