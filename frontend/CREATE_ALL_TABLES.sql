-- =====================================================
-- SCRIPT COMPLETO - CRIAR TODAS AS TABELAS NECESSÁRIAS
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

-- Índices para organizational_structure
CREATE INDEX IF NOT EXISTS idx_organizational_structure_parent ON public.organizational_structure(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizational_structure_type ON public.organizational_structure(type);
CREATE INDEX IF NOT EXISTS idx_organizational_structure_responsible ON public.organizational_structure(responsible_id);
CREATE INDEX IF NOT EXISTS idx_org_structure_owner_id ON public.organizational_structure(owner_id);

-- Comentários
COMMENT ON TABLE public.organizational_structure IS 'Estrutura organizacional da empresa (setores, cargos e pessoas)';
COMMENT ON COLUMN public.organizational_structure.owner_id IS 'ID único da empresa para isolamento de dados';
COMMENT ON COLUMN public.organizational_structure.type IS 'Tipo do item: sector (setor), position (cargo) ou person (pessoa)';

-- =====================================================
-- 2. CONFIGURAR TABELA PROFILES
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  owner_id UUID,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  avatar_url TEXT,
  position TEXT,
  department TEXT,
  role TEXT DEFAULT 'user',
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS position TEXT;

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Comentários
COMMENT ON COLUMN public.profiles.owner_id IS 'ID único da empresa - todos os usuários da mesma empresa compartilham o mesmo owner_id';

-- =====================================================
-- 3. CONFIGURAR TABELA COMPANY_USERS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  full_name TEXT,
  email TEXT NOT NULL,
  password_hash TEXT,
  phone TEXT,
  company_name TEXT,
  position TEXT,
  employees_count TEXT,
  business_niche TEXT,
  target_audience TEXT,
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas se não existirem
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT,
ADD COLUMN IF NOT EXISTS business_niche TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Remover constraints problemáticas
ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_company_id_fkey,
DROP CONSTRAINT IF EXISTS company_users_owner_id_fkey;

-- Índice para company_users
CREATE INDEX IF NOT EXISTS idx_company_users_owner_id ON public.company_users(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_users_email ON public.company_users(email);

-- Comentários
COMMENT ON COLUMN public.company_users.owner_id IS 'ID único da empresa - gerado no primeiro cadastro';

-- =====================================================
-- 4. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- RLS para organizational_structure
ALTER TABLE public.organizational_structure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to organizational_structure" ON public.organizational_structure;
DROP POLICY IF EXISTS "org_structure_policy" ON public.organizational_structure;

CREATE POLICY "org_structure_policy" ON public.organizational_structure
  FOR ALL USING (
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    owner_id IS NULL
  );

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = id::text OR
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS para company_users
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_users_policy" ON public.company_users;

CREATE POLICY "company_users_policy" ON public.company_users
  FOR ALL USING (
    auth.uid()::text = owner_id::text OR
    owner_id IN (
      SELECT owner_id FROM public.company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) OR
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 5. CRIAR TRIGGER PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_organizational_structure_updated_at ON public.organizational_structure;
CREATE TRIGGER update_organizational_structure_updated_at
  BEFORE UPDATE ON public.organizational_structure
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_users_updated_at ON public.company_users;
CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON public.company_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar organizational_structure
SELECT 
  'organizational_structure' as tabela,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizational_structure' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar profiles
SELECT 
  'profiles' as tabela,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar company_users
SELECT 
  'company_users' as tabela,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

