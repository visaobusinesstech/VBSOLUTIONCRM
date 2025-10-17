-- TESTE SIMPLES DE INSERÇÃO DE EMPRESAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. REMOVER CONSTRAINTS TEMPORARIAMENTE (se existirem)
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_fantasy_name_owner_unique;
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_cnpj_unique;

-- 2. TESTAR INSERÇÃO SIMPLES
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id
) VALUES (
    'Teste Simples ' || extract(epoch from now()), 
    'Teste LTDA', 
    'teste@simples.com', 
    'active', 
    auth.uid()
) RETURNING *;

-- 3. VERIFICAR EMPRESAS CRIADAS
SELECT id, fantasy_name, company_name, email, status, owner_id, created_at
FROM public.companies 
ORDER BY created_at DESC 
LIMIT 5;
