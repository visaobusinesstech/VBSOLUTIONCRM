-- SQL SIMPLIFICADO para verificar tabelas do sistema de email
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
    'Tabelas existentes:' as status,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agendamentos', 'templates', 'configuracoes', 'envios_historico')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela agendamentos
SELECT 
    'Estrutura da tabela agendamentos:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela templates
SELECT 
    'Estrutura da tabela templates:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela configuracoes
SELECT 
    'Estrutura da tabela configuracoes:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela envios_historico
SELECT 
    'Estrutura da tabela envios_historico:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'envios_historico' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar RLS das tabelas
SELECT 
    'RLS das tabelas:' as info,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename IN ('agendamentos', 'templates', 'configuracoes', 'envios_historico')
AND schemaname = 'public';

-- 7. Contar registros em cada tabela
SELECT 'Contagem de registros:' as info, 'agendamentos' as tabela, COUNT(*) as total FROM agendamentos
UNION ALL
SELECT 'Contagem de registros:', 'templates', COUNT(*) FROM templates
UNION ALL
SELECT 'Contagem de registros:', 'configuracoes', COUNT(*) FROM configuracoes
UNION ALL
SELECT 'Contagem de registros:', 'envios_historico', COUNT(*) FROM envios_historico;
