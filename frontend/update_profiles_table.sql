-- =====================================================
-- SCRIPT PARA CONFIGURAÇÃO DA TABELA PROFILES
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Garantir que a coluna owner_id existe na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 2. Garantir que outras colunas necessárias existem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS position TEXT;

-- 3. Criar índice para owner_id para performance
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);

-- 4. Criar índice para email para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 5. Remover políticas antigas
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 6. Criar políticas RLS para isolamento de dados por owner_id
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = id::text OR
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (
    owner_id IN (
      SELECT owner_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 7. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Adicionar comentários para documentação
COMMENT ON COLUMN public.profiles.owner_id IS 'ID único da empresa para isolamento de dados';
COMMENT ON COLUMN public.profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.company IS 'Nome da empresa';
COMMENT ON COLUMN public.profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.profiles.position IS 'Cargo do usuário na empresa';

-- 9. Verificar a estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
