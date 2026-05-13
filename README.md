# RemixSo

AI content repurposing for solo creators. Turn one article into platform-perfect posts for X (Twitter), LinkedIn, Instagram, TikTok, YouTube Shorts, and email newsletters — keeping your voice, just changing the format.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL, RLS)
- **AI**: DeepSeek (via OpenAI-compatible SDK)
- **Payments**: Dodo Payments (Checkout, Customer Portal, Webhooks)
- **State**: Zustand
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (free tier works)
- DeepSeek API key
- Dodo Payments account (for payments)

### Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepSeek
DEEPSEEK_API_KEY=sk-your-api-key
DEEPSEEK_MODEL=deepseek-v4-pro

# Dodo Payments
DODO_PAYMENTS_API_KEY=dodo_live_...
DODO_PAYMENTS_WEBHOOK_KEY=wh_live_...
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PRO_PRODUCT_ID=product_...
```

### Install & Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run test       # run API tests
npm run lint       # ESLint
```

### Database Setup

Run these SQL migrations in your Supabase SQL editor to create the required tables and RLS policies. See `supabase/migrations/` for the full DDL.

### Dodo Payments Webhooks

For local development, use a webhook forwarding service (e.g., ngrok) to expose your local server. Configure the webhook endpoint in the Dodo Payments dashboard:

```
https://your-ngrok-url/api/webhooks/dodo
```

Select all subscription events and copy the Webhook Key to `DODO_PAYMENTS_WEBHOOK_KEY`.

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── generate/       # AI content generation
│   │   ├── refine/         # Single-platform refinement
│   │   ├── retry-platform/ # Retry failed platform generation
│   │   ├── fetch-url/      # URL content extraction
│   │   ├── history/        # Generation history CRUD
│   │   ├── create-checkout-session/
│   │   ├── create-portal-session/
│   │   ├── sync-subscription/
│   │   └── webhooks/dodo/
│   ├── auth/               # Auth callback & signin page
│   ├── dashboard/          # Main workspace
│   ├── account/            # User account management
│   │   └── referral/        # Invite codes & auto-apply
│   └── product/            # Product landing page
├── components/
│   ├── dashboard/          # Workspace, OutputCard, HistoryPanel, etc.
│   ├── account/            # Account actions, ReferralCard
│   ├── referral/           # RefCookieSetter, RefAutoApply, ReferralBanner
│   ├── layout/             # Header, Footer, Container
│   └── ui/                 # Shared primitives (Button, Dialog, Toast, etc.)
├── lib/
│   ├── deepseek/           # AI pipeline (tone analysis + platform generation)
│   ├── supabase/           # Server & client Supabase helpers
│   ├── content/            # URL fetcher + HTML extraction
│   ├── dodo.ts             # Dodo Payments SDK wrapper
│   ├── credit-manager.ts   # Usage tracking with optimistic locking
│   ├── referral.ts         # Referral logic: applyReferralCode + addBonus
│   └── rate-limit.ts       # In-memory rate limiting
├── store/                  # Zustand stores (generation, history)
├── providers/              # Auth context provider
└── types/                  # TypeScript type definitions
```

## API Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/generate` | POST | Optional | 5/min | AI content repurposing across platforms |
| `/api/refine` | POST | Optional | 10/min | Edit a single platform output |
| `/api/retry-platform` | POST | Optional | — | Retry a failed platform generation |
| `/api/fetch-url` | POST | Optional | 10/min | Extract text content from a URL |
| `/api/history` | GET/DELETE | Required | — | List or delete generation history |
| `/api/history/[id]` | DELETE | Required | — | Delete a single history entry (ownership check) |
| `/api/user` | GET | Required | — | Current user info |
| `/api/user/credits` | GET | Optional | — | Credits and subscription status |
| `/api/create-checkout-session` | POST | Required | — | Dodo Payments checkout |
| `/api/create-portal-session` | POST | Required | — | Dodo customer portal |
| `/api/sync-subscription` | POST | Required | — | Sync subscription status from Dodo |
| `/api/webhooks/dodo` | POST | — | — | Dodo webhook (9 event types) |
| `/api/account/delete` | DELETE | Required | — | Delete user account |
| `/api/referral/generate-code` | POST | Required | — | Generate unique invite code |
| `/api/referral/apply` | POST | Required | — | Redeem invite code, both get +3 bonus |
| `/api/referral/stats` | GET | Required | — | Referral code, invite count, bonus earned |

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_INPUT` | 400 | Missing or invalid request fields |
| `RATE_LIMITED` | 429 | Too many requests |
| `CREDITS_EXHAUSTED` | 402 | No generations remaining |
| `URL_FETCH_FAILED` | 500 | Could not extract URL content |
| `AI_GENERATION_FAILED` | 500 | DeepSeek API error |

## License

Proprietary. All rights reserved.
