# RemixSo

AI content repurposing for solo creators. Turn one article into platform-perfect posts for X (Twitter), LinkedIn, Instagram, TikTok, YouTube Shorts, and email newsletters — keeping your voice, just changing the format.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL, RLS)
- **AI**: DeepSeek (via OpenAI-compatible SDK)
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **State**: Zustand
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project (free tier works)
- DeepSeek API key
- Stripe account (for payments)

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepSeek
DEEPSEEK_API_KEY=sk-your-api-key
DEEPSEEK_MODEL=deepseek-chat

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
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

### Stripe Webhooks

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── generate/       # AI content generation
│   │   ├── refine/         # Single-platform refinement
│   │   ├── fetch-url/      # URL content extraction
│   │   ├── history/        # Generation history CRUD
│   │   ├── create-checkout-session/
│   │   ├── create-portal-session/
│   │   └── webhooks/stripe/
│   ├── auth/               # Auth callback & signin page
│   ├── dashboard/          # Main workspace
│   ├── account/            # User account management
│   └── product/            # Product landing page
├── components/
│   ├── dashboard/          # Workspace, OutputCard, HistoryPanel, etc.
│   ├── layout/             # Header, Footer, Container
│   └── ui/                 # Shared primitives (Button, Dialog, Toast, etc.)
├── lib/
│   ├── deepseek/           # AI pipeline (tone analysis + platform generation)
│   ├── supabase/           # Server & client Supabase helpers
│   ├── content/            # URL fetcher + HTML extraction
│   ├── credit-manager.ts   # Usage tracking with optimistic locking
│   ├── rate-limit.ts       # In-memory rate limiting
│   └── stripe.ts           # Stripe server helpers
├── store/                  # Zustand stores (generation, history)
├── providers/              # Auth context provider
└── types/                  # TypeScript type definitions
```

## API Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/generate` | POST | Optional | 5/min | AI content repurposing across platforms |
| `/api/refine` | POST | Optional | 10/min | Edit a single platform output |
| `/api/fetch-url` | POST | Optional | 10/min | Extract text content from a URL |
| `/api/history` | GET/DELETE | Required | — | List or delete generation history |

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
