# RemixSo

AI content repurposing tool — turn one article into platform-optimized posts for X, LinkedIn, Instagram, TikTok, YouTube Shorts, and email newsletters.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS 4
- Supabase (Auth + PostgreSQL + RLS)
- DeepSeek API (via OpenAI-compatible SDK)
- Dodo Payments (subscription billing, MoR)
- Zustand (client state)

## Hard Boundaries

- **Prisma 不存在** — 项目用 Supabase client 直连，没有 ORM。所有数据库操作走 `@/lib/supabase/server` 和 `src/lib/credit-manager.ts`
- **RLS 写操作必须用 service client** — 普通 `createClient()` 无法绕过 RLS 写入 `platform_outputs`，写入/删除用 `createServiceClient()`
- **付费用 Dodo Payments，不是 Stripe** — SDK 在 `src/lib/dodo.ts`，Webhook 在 `src/app/api/webhooks/dodo/`
- **不要硬编码额度数字** — 从 `src/lib/credit-manager.ts` 导入 `FREE_MONTHLY_LIMIT` / `PRO_MONTHLY_LIMIT` / `ANONYMOUS_LIFETIME_LIMIT`
- **生成流水线两层**：语气分析（1 次 API）→ 平台改写（N 次并行），prompt 模板在 `src/lib/deepseek/`
- **生成结果必须持久化** — `platform_outputs` 表由 generate 和 refine API 写入，否则历史记录看不到结果
- **禁止裸跑删除命令** — 账户删除有确认弹窗 + `DELETE /api/account/delete`
- **移动端适配** — 改动 UI 时注意 `sm:` 断点，Header 移动菜单用汉堡按钮

## 环境变量

完整列表见 `.env.local.example`，关键变量：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role（服务端 RLS 绕过） |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `DEEPSEEK_MODEL` | 模型名，默认 `deepseek-v4-pro` |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo Webhook 验签 key |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` 或 `live_mode` |
| `DODO_PRO_PRODUCT_ID` | Pro 订阅产品 ID |
| `NEXT_PUBLIC_APP_URL` | 应用 URL，本地 `http://localhost:3000` |

## API 路由

| 端点 | Method | Auth | 限流 | 说明 |
|------|--------|------|------|------|
| `/api/generate` | POST | Optional | 5/min | 语气分析 + 并行生成（每个平台单独 promise） |
| `/api/refine` | POST | Optional | 10/min | 单平台微调，免费用户每条只能 refine 一次 |
| `/api/retry-platform` | POST | Optional | — | 重试单个失败的平台 |
| `/api/fetch-url` | POST | Optional | 10/min | URL 内容抓取 |
| `/api/history` | GET/DELETE | Required | — | 历史记录列表/删除 |
| `/api/history/[id]` | DELETE | Required | — | 单条历史删除（含所有权验证） |
| `/api/create-checkout-session` | POST | Required | — | Dodo 结账 |
| `/api/create-portal-session` | POST | Required | — | Dodo 管理门户 |
| `/api/sync-subscription` | POST | Required | — | 订阅状态同步 |
| `/api/webhooks/dodo` | POST | — | — | Dodo Webhook（9 种事件） |
| `/api/user` | GET | Required | — | 用户信息 |
| `/api/user/credits` | GET | Optional | — | 积分和订阅状态查询 |
| `/api/account/delete` | DELETE | Required | — | 账户删除 |

## 关键模块

```
src/lib/
├── dodo.ts              # Dodo Payments SDK 封装
├── deepseek/
│   ├── client.ts        # DeepSeek API 客户端
│   ├── analyzer.ts      # 语气分析（1 次调用）
│   ├── pipeline.ts      # 生成流水线编排
│   └── prompts/         # 各平台 system prompt
├── supabase/
│   ├── server.ts        # createClient / createServiceClient
│   └── client.ts        # 浏览器端 Supabase client
├── content/
│   └── fetcher.ts       # URL 内容抓取 + HTML 解析
├── credit-manager.ts    # 积分检查/扣减（原子操作 + 乐观锁）
└── rate-limit.ts        # 内存限流（单实例可用，多实例需 Redis）

src/store/
├── generation-store.ts  # 生成状态 + per-platform 状态追踪
└── history-store.ts     # 历史记录 CRUD

src/providers/
└── auth-provider.tsx    # Auth context（含 useCredits hook）
```

## 数据库

- **Supabase PostgreSQL**，RLS 全表启用
- 迁移文件在 `supabase/migrations/`
- 关键表：`generations`（用户拥有，RLS 可读）、`platform_outputs`（generation 子表，RLS service client 写入）、`subscriptions`（Dodo 管理）
- 订阅状态 enum：`active` / `trialing` / `past_due` / `canceled` / `inactive` / `expired` / `paused`
- 额度用 `used_count` 列 + 乐观锁（`LIMIT 1` + `RETURNING`）防竞态
- 新用户首次扣减时自动 INSERT 初始行

## 支付流（Dodo Payments）

1. 前端 `POST /api/create-checkout-session` → Dodo SDK 创建 checkout → 返回 URL
2. 用户完成支付 → Dodo 回调 `POST /api/webhooks/dodo`
3. Webhook 处理 `subscription.created` / `subscription.updated` / `subscription.canceled` 等 9 种事件
4. 前端 `/account?checkout=success` 时调用 `POST /api/sync-subscription` 同步状态
5. 取消订阅通过 `POST /api/create-portal-session` 跳转 Dodo 管理门户

**当前状态（2026-05-10）**：Dodo KYC 审核通过，已切换到 live_mode。

## 深入文档

| 文档 | 内容 |
|------|------|
| `docs/design-handoff.md` | 完整 UI 规格——页面结构、组件清单、所有文案、状态矩阵、设计 token |
| `docs/prompt-reference.md` | 6 个平台的 System Prompt 全文 + User Message 模板 + 跨平台对比表 |
| `docs/stitch-prompt.md` | 给 Stitch 设计工具的 prompt——约束、设计 token、各页面要求 |
| `docs/launch/product-hunt-launch.md` | 冷启动素材包——截图清单、种子内容、PH 文案、发帖草稿、视频脚本 |
| `README.md` | 项目概览、安装步骤、API 端点表、错误码 |
| `.env.local.example` | 环境变量清单（含说明注释） |
