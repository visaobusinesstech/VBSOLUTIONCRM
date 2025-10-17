-- CORRIGIR TRIGGER DE COMPANY_SETTINGS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. VERIFICAR SE O TRIGGER EXISTE
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'companies'
AND trigger_name LIKE '%company_settings%';

-- 2. VERIFICAR ESTRUTURA DA TABELA company_settings
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. ADICIONAR CONSTRAINT ÚNICA PARA company_id (se não existir)
ALTER TABLE public.company_settings 
ADD CONSTRAINT IF NOT EXISTS company_settings_company_id_unique 
UNIQUE (company_id);

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
    'Teste Trigger ' || extract(epoch from now()), 
    'Teste Trigger LTDA', 
    'teste@trigger.com', 
    'active', 
    auth.uid()
) RETURNING *;

-- 6. VERIFICAR SE O TRIGGER CRIOU OS SETTINGS
SELECT 
    cs.company_id,
    cs.company_name,
    cs.primary_color,
    cs.sidebar_color,
    c.fantasy_name
FROM public.company_settings cs
JOIN public.companies c ON c.id = cs.company_id
ORDER BY cs.created_at DESC
LIMIT 3;
