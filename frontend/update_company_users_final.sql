-- =====================================================
-- SCRIPT FINAL PARA ATUALIZAÇÃO DA TABELA COMPANY_USERS
-- =====================================================
-- Execute este script no SQL Editor do Supabase para resolver os problemas de constraint
-- =====================================================

-- 1. Remover todas as constraints de chave estrangeira existentes
ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_company_id_fkey;

ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_owner_id_fkey;

-- 2. Remover a coluna company_id se existir (não é mais necessária)
ALTER TABLE public.company_users 
DROP COLUMN IF EXISTS company_id;

-- 3. Garantir que a coluna owner_id existe e é do tipo correto
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 4. Adicionar outras colunas necessárias se não existirem
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT,
ADD COLUMN IF NOT EXISTS business_niche TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. Criar índice para owner_id para performance
CREATE INDEX IF NOT EXISTS idx_company_users_owner_id ON public.company_users(owner_id);

-- 6. Atualizar a política RLS para usar owner_id
DROP POLICY IF EXISTS "company_users_policy" ON public.company_users;

CREATE POLICY "company_users_policy" ON public.company_users
  FOR ALL USING (
    auth.uid()::text = owner_id::text
  );

-- 7. Habilitar RLS na tabela
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- 8. Adicionar comentários para documentação
COMMENT ON COLUMN public.company_users.owner_id IS 'ID único da empresa para isolamento de dados';
COMMENT ON COLUMN public.company_users.company_name IS 'Nome da empresa';
COMMENT ON COLUMN public.company_users.position IS 'Cargo do usuário na empresa';
COMMENT ON COLUMN public.company_users.employees_count IS 'Quantidade de funcionários da empresa';
COMMENT ON COLUMN public.company_users.business_niche IS 'Nicho de atuação da empresa';
COMMENT ON COLUMN public.company_users.target_audience IS 'Público-alvo da empresa';
COMMENT ON COLUMN public.company_users.role IS 'Função do usuário (admin, user, etc.)';
COMMENT ON COLUMN public.company_users.status IS 'Status do usuário (active, inactive, etc.)';

-- 9. Verificar se a tabela profiles tem owner_id
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 10. Criar índice para owner_id na tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);

-- 11. Atualizar política RLS para profiles
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;

CREATE POLICY "profiles_policy" ON public.profiles
  FOR ALL USING (
    auth.uid()::text = id::text OR 
    auth.uid()::text = owner_id::text
  );

-- 12. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
