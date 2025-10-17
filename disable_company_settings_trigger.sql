-- DESABILITAR TRIGGER TEMPORARIAMENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. LISTAR TRIGGERS DA TABELA COMPANIES
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'companies'
ORDER BY trigger_name;

-- 2. DESABILITAR TRIGGER DE COMPANY_SETTINGS
ALTER TABLE public.companies DISABLE TRIGGER ALL;

-- 3. TESTAR INSERÇÃO SEM TRIGGER
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id
) VALUES (
    'Teste Sem Trigger ' || extract(epoch from now()), 
    'Teste Sem Trigger LTDA', 
    'teste@semtrigger.com', 
    'active', 
    auth.uid()
) RETURNING *;

-- 4. VERIFICAR EMPRESAS CRIADAS
SELECT id, fantasy_name, company_name, email, status, owner_id, created_at
FROM public.companies 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. REABILITAR TRIGGERS (se necessário)
-- ALTER TABLE public.companies ENABLE TRIGGER ALL;
