-- CORRIGIR ESTRUTURA DA TABELA COMPANIES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all access to companies" ON public.companies;
DROP POLICY IF EXISTS "Usuários podem ver e editar apenas suas próprias empresas" ON public.companies;
DROP POLICY IF EXISTS "Usuários só veem suas próprias empresas" ON public.companies;
DROP POLICY IF EXISTS "Allow all for authenticated users - companies" ON public.companies;
DROP POLICY IF EXISTS "company_isolation" ON public.companies;
DROP POLICY IF EXISTS "Isolamento por empresa - companies" ON public.companies;

-- 3. ADICIONAR COLUNAS NECESSÁRIAS SE NÃO EXISTIREM
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
    
    -- Adicionar company_name se não existir (algumas migrações usam 'name')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'company_name'
        AND table_schema = 'public'
    ) THEN
        -- Se existe 'name', renomear para 'company_name'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'name'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.companies RENAME COLUMN name TO company_name;
        ELSE
            ALTER TABLE public.companies ADD COLUMN company_name TEXT;
        END IF;
    END IF;
    
    -- Adicionar is_supplier se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'is_supplier'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN is_supplier BOOLEAN DEFAULT false;
    END IF;
    
    -- Adicionar activity_data se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'activity_data'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN activity_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. TORNAR COLUNAS OPCIONAIS TEMPORARIAMENTE
ALTER TABLE public.companies ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.companies ALTER COLUMN created_by DROP NOT NULL;

-- 5. CRIAR POLÍTICA SIMPLES
CREATE POLICY "Allow all for authenticated users - companies" ON public.companies
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 6. HABILITAR RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 7. TESTAR INSERÇÃO
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id, 
    created_by
) VALUES (
    'Teste Estrutura', 
    'Teste LTDA', 
    'teste@teste.com', 
    'active', 
    auth.uid(), 
    auth.uid()
) RETURNING *;

-- 8. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;
