-- CORRIGIR CONSTRAINT DA TABELA COMPANY_SETTINGS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA company_settings
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS EXISTENTES
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.company_settings'::regclass
ORDER BY conname;

-- 3. ADICIONAR CONSTRAINT ÚNICA PARA company_id (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.company_settings'::regclass 
        AND conname = 'company_settings_company_id_unique'
    ) THEN
        ALTER TABLE public.company_settings 
        ADD CONSTRAINT company_settings_company_id_unique 
        UNIQUE (company_id);
    END IF;
END $$;

-- 4. VERIFICAR SE A CONSTRAINT FOI CRIADA
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.company_settings'::regclass
AND conname LIKE '%company_id%';

-- 5. TESTAR INSERÇÃO DE EMPRESA
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id
) VALUES (
    'Teste Final ' || extract(epoch from now()), 
    'Teste Final LTDA', 
    'teste@final.com', 
    'active', 
    auth.uid()
) RETURNING *;
