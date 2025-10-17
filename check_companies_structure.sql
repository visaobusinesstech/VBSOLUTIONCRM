-- VERIFICAR E CORRIGIR ESTRUTURA DA TABELA COMPANIES
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE A TABELA TEM owner_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'owner_id'
            AND table_schema = 'public'
        ) THEN 'owner_id existe'
        ELSE 'owner_id NÃO existe'
    END as owner_id_status;

-- 3. VERIFICAR SE A TABELA TEM created_by
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'created_by'
            AND table_schema = 'public'
        ) THEN 'created_by existe'
        ELSE 'created_by NÃO existe'
    END as created_by_status;

-- 4. VERIFICAR SE A TABELA TEM responsible_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'responsible_id'
            AND table_schema = 'public'
        ) THEN 'responsible_id existe'
        ELSE 'responsible_id NÃO existe'
    END as responsible_id_status;

-- 5. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;
