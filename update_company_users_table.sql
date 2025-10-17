-- =====================================================
-- ATUALIZAÇÃO DA TABELA COMPANY_USERS
-- =====================================================
-- Execute este script no SQL Editor do Supabase para adicionar as colunas necessárias
-- =====================================================

-- Adicionar colunas para dados da empresa na tabela company_users
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT,
ADD COLUMN IF NOT EXISTS business_niche TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Adicionar índice para owner_id para performance
CREATE INDEX IF NOT EXISTS idx_company_users_owner_id ON public.company_users(owner_id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.company_users.owner_id IS 'ID único da empresa para isolamento de dados';
COMMENT ON COLUMN public.company_users.company_name IS 'Nome da empresa';
COMMENT ON COLUMN public.company_users.position IS 'Cargo do usuário na empresa';
COMMENT ON COLUMN public.company_users.employees_count IS 'Quantidade de funcionários da empresa';
COMMENT ON COLUMN public.company_users.business_niche IS 'Nicho de atuação da empresa';
COMMENT ON COLUMN public.company_users.target_audience IS 'Público-alvo da empresa';
COMMENT ON COLUMN public.company_users.role IS 'Função do usuário (admin, user, etc.)';

-- Atualizar a política RLS para incluir owner_id
DROP POLICY IF EXISTS "company_users_policy" ON public.company_users;

CREATE POLICY "company_users_policy" ON public.company_users
  FOR ALL USING (
    auth.uid()::text = owner_id::text OR 
    auth.uid()::text = company_id::text
  );

-- Habilitar RLS na tabela
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
