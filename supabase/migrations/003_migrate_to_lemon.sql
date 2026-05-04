-- 003: Stripe → Lemonsqueezy 迁移
-- 重命名列 + 新增订阅状态枚举值

BEGIN;

-- 1. 新增 Lemonsqueezy 独有的订阅状态（PostgreSQL 只支持 ADD VALUE）
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'paused';

-- 2. 重命名 Stripe 特定列为供应商中立名称
ALTER TABLE subscriptions RENAME COLUMN stripe_customer_id TO customer_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO subscription_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_price_id TO variant_id;

COMMIT;
