-- =====================================================
-- SCRIPT SIMPLES - CRIAR TABELAS E POLÍTICAS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA ORGANIZATIONAL_STRUCTURE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizational_structure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sector', 'position', 'person')),
  parent_id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE,
  responsible_id UUID,
  description TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. GARANTIR COLUNAS NA TABELA PROFILES
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS position TEXT;

-- =====================================================
-- 3. GARANTIR COLUNAS NA TABELA COMPANY_USERS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas se não existirem
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Remover constraints problemáticas se existirem
ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_company_id_fkey,
DROP CONSTRAINT IF EXISTS company_users_owner_id_fkey;

-- =====================================================
-- 4. CRIAR ÍNDICES
-- =====================================================

-- Índices para organizational_structure
CREATE INDEX IF NOT EXISTS idx_org_structure_owner_id ON public.organizational_structure(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_structure_type ON public.organizational_structure(type);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Índices para company_users
CREATE INDEX IF NOT EXISTS idx_company_users_owner_id ON public.company_users(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_users_email ON public.company_users(email);

-- =====================================================
-- 5. CRIAR POLÍTICAS RLS SIMPLES
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "company_users_policy" ON public.company_users;
DROP POLICY IF EXISTS "company_users_simple_policy" ON public.company_users;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_simple_policy" ON public.profiles;
DROP POLICY IF EXISTS "org_structure_policy" ON public.organizational_structure;
DROP POLICY IF EXISTS "org_structure_simple_policy" ON public.organizational_structure;

-- Política para organizational_structure
CREATE POLICY "org_structure_policy" ON public.organizational_structure
  FOR ALL USING (
    auth.uid()::text = owner_id::text OR
    owner_id IS NULL
  );

-- Política para profiles
CREATE POLICY "profiles_policy" ON public.profiles
  FOR ALL USING (
    auth.uid()::text = id::text OR 
    auth.uid()::text = owner_id::text
  );

-- Política para company_users
CREATE POLICY "company_users_policy" ON public.company_users
  FOR ALL USING (
    auth.uid()::text = owner_id::text
  );

-- =====================================================
-- 6. HABILITAR RLS
-- =====================================================

ALTER TABLE public.organizational_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. VERIFICAR TABELAS CRIADAS
-- =====================================================

-- Verificar se as tabelas existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('organizational_structure', 'profiles', 'company_users')
ORDER BY table_name;

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('organizational_structure', 'profiles', 'company_users')
ORDER BY tablename, policyname;
