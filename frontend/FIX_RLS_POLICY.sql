-- =====================================================
-- CORRIGIR POLÍTICA RLS - RESOLVER RECURSÃO INFINITA
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "company_users_policy" ON public.company_users;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "org_structure_policy" ON public.organizational_structure;

-- 2. CRIAR POLÍTICAS SIMPLES E SEGURAS

-- Política para company_users (SEM recursão)
CREATE POLICY "company_users_simple_policy" ON public.company_users
  FOR ALL USING (
    auth.uid()::text = owner_id::text
  );

-- Política para profiles (SEM recursão)
CREATE POLICY "profiles_simple_policy" ON public.profiles
  FOR ALL USING (
    auth.uid()::text = id::text OR 
    auth.uid()::text = owner_id::text
  );

-- Política para organizational_structure (SEM recursão)
CREATE POLICY "org_structure_simple_policy" ON public.organizational_structure
  FOR ALL USING (
    auth.uid()::text = owner_id::text OR
    owner_id IS NULL
  );

-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_structure ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('company_users', 'profiles', 'organizational_structure')
ORDER BY tablename, policyname;
