-- Referral system: invite codes, referrer tracking, bonus credits

-- 1. Add referral columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Add bonus generations to usage_credits (never resets)
ALTER TABLE public.usage_credits ADD COLUMN IF NOT EXISTS bonus_generations INTEGER NOT NULL DEFAULT 0;

-- 3. RLS: allow reading referral_code on any profile (needed to resolve referrer info)
CREATE POLICY "read_referral_code" ON public.profiles
  FOR SELECT USING (true);
