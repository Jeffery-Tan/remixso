-- 002: 修复 platform_outputs 缺少 INSERT/UPDATE/DELETE RLS 策略
-- 以及 generations 缺少 DELETE 策略
-- 问题：001 只创建了 SELECT 策略，导致写入/删除被静默拒绝
-- 可重复执行：先删后建

-- === platform_outputs ===
DROP POLICY IF EXISTS "insert_own_outputs" ON public.platform_outputs;
CREATE POLICY "insert_own_outputs" ON public.platform_outputs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.generations g
    WHERE g.id = generation_id
    AND (g.user_id = auth.uid() OR g.anonymous_session_id IS NOT NULL)
  ));

DROP POLICY IF EXISTS "update_own_outputs" ON public.platform_outputs;
CREATE POLICY "update_own_outputs" ON public.platform_outputs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.generations g
    WHERE g.id = generation_id
    AND g.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.generations g
    WHERE g.id = generation_id
    AND g.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "delete_own_outputs" ON public.platform_outputs;
CREATE POLICY "delete_own_outputs" ON public.platform_outputs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.generations g
    WHERE g.id = generation_id
    AND g.user_id = auth.uid()
  ));

-- === generations ===
DROP POLICY IF EXISTS "delete_own_generations" ON public.generations;
CREATE POLICY "delete_own_generations" ON public.generations FOR DELETE
  USING (auth.uid() = user_id);
