-- CORRIGIR RLS DA TABELA COMPANIES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all access to companies" ON public.companies;
DROP POLICY IF EXISTS "Usuários podem ver e editar apenas suas próprias empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários só veem suas próprias empresas" ON public.companies;
DROP POLICY IF EXISTS "company_isolation" ON public.companies;
DROP POLICY IF EXISTS "Isolamento por empresa - companies" ON public.companies;

-- 3. VERIFICAR E CRIAR COLUNAS NECESSÁRIAS
DO $$ 
BEGIN
    -- Adicionar owner_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN owner_id UUID;
    END IF;
    
    -- Adicionar created_by se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN created_by UUID;
    END IF;
END $$;

-- 4. TORNAR owner_id OPCIONAL TEMPORARIAMENTE
ALTER TABLE public.companies ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.companies ALTER COLUMN created_by DROP NOT NULL;

-- 5. CRIAR POLÍTICAS SIMPLES
CREATE POLICY "Allow all for authenticated users - companies" ON public.companies
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 6. HABILITAR RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 7. TESTAR INSERÇÃO
INSERT INTO public.companies (fantasy_name, company_name, email, status, owner_id, created_by)
VALUES ('Teste RLS Companies', 'Teste LTDA', 'teste@teste.com', 'active', auth.uid(), auth.uid())
RETURNING *;

-- 8. VERIFICAR POLÍTICAS CRIADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;
