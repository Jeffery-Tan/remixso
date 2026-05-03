-- RemixSo 初始数据库迁移
-- 在 Supabase SQL Editor 中运行

-- 1. 用户资料表（扩展 auth.users）
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. 积分表
CREATE TABLE public.usage_credits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  anonymous_session_id    TEXT UNIQUE,
  free_generations_used   INTEGER NOT NULL DEFAULT 0,
  paid_generations_used   INTEGER NOT NULL DEFAULT 0,
  free_reset_at           TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT one_row_per_user UNIQUE (user_id),
  CONSTRAINT one_row_per_anon UNIQUE (anonymous_session_id),
  CONSTRAINT has_identity CHECK (
    user_id IS NOT NULL OR anonymous_session_id IS NOT NULL
  )
);

-- 3. 订阅类型
CREATE TYPE subscription_status AS ENUM (
  'inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);

-- 4. 订阅表（Stripe 镜像）
CREATE TABLE public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id        TEXT UNIQUE,
  stripe_subscription_id    TEXT UNIQUE,
  stripe_price_id           TEXT,
  status                    subscription_status NOT NULL DEFAULT 'inactive',
  trial_started_at          TIMESTAMPTZ,
  trial_ends_at             TIMESTAMPTZ,
  current_period_start_at   TIMESTAMPTZ,
  current_period_ends_at    TIMESTAMPTZ,
  canceled_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 来源类型
CREATE TYPE source_type AS ENUM ('text', 'url');

-- 6. 生成记录表
CREATE TABLE public.generations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_session_id TEXT,
  source_type       source_type NOT NULL,
  source_content    TEXT NOT NULL,
  source_title      TEXT,
  source_url        TEXT,
  platforms         TEXT[] NOT NULL,
  tone_profile      JSONB,
  total_tokens_used INTEGER DEFAULT 0,
  processing_ms     INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);

-- 7. 平台代码
CREATE TYPE platform_code AS ENUM (
  'twitter', 'linkedin', 'instagram', 'newsletter', 'tiktok', 'youtube-shorts'
);

-- 8. 平台输出表
CREATE TABLE public.platform_outputs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id     UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  platform          platform_code NOT NULL,
  generated_content TEXT NOT NULL,
  edited_content    TEXT,
  prompt_used       TEXT,
  tokens_used       INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (generation_id, platform)
);

CREATE INDEX idx_outputs_generation_id ON public.platform_outputs(generation_id);

-- =====================================================
-- RLS (Row-Level Security)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_outputs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usage credits
CREATE POLICY "read_own_credits" ON public.usage_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update_own_credits" ON public.usage_credits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insert_own_credits" ON public.usage_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "read_own_subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Generations
CREATE POLICY "read_own_generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Platform outputs
CREATE POLICY "read_own_outputs" ON public.platform_outputs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.generations g
    WHERE g.id = generation_id
    AND (g.user_id = auth.uid() OR g.anonymous_session_id IS NOT NULL)
  ));
