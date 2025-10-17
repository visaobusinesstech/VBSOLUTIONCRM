-- CORRIGIR CONSTRAINTS DA TABELA COMPANIES (VERSÃO CORRIGIDA)
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. VERIFICAR CONSTRAINTS EXISTENTES
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.companies'::regclass;

-- 2. ADICIONAR CONSTRAINT ÚNICA PARA fantasy_name + owner_id
-- Isso evita empresas duplicadas para o mesmo usuário
ALTER TABLE public.companies 
ADD CONSTRAINT companies_fantasy_name_owner_unique 
UNIQUE (fantasy_name, owner_id);

-- 3. ADICIONAR CONSTRAINT ÚNICA PARA CNPJ (sem WHERE)
-- Isso evita CNPJs duplicados (incluindo nulls)
ALTER TABLE public.companies 
ADD CONSTRAINT companies_cnpj_unique 
UNIQUE (cnpj);

-- 4. VERIFICAR NOVAS CONSTRAINTS
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.companies'::regclass
ORDER BY conname;

-- 5. TESTAR INSERÇÃO
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id
) VALUES (
    'Teste Constraint', 
    'Teste LTDA', 
    'teste@constraint.com', 
    'active', 
    auth.uid()
) RETURNING *;
