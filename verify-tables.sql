-- SQL para verificar se as tabelas do sistema de email foram criadas corretamente
-- Execute este SQL no Supabase SQL Editor para diagnosticar problemas

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agendamentos', 'templates', 'configuracoes', 'envios_historico')
ORDER BY table_name;

-- Verificar estrutura da tabela agendamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela templates
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela configuracoes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'configuracoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela envios_historico
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'envios_historico' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar RLS (Row Level Security) das tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('agendamentos', 'templates', 'configuracoes', 'envios_historico')
AND schemaname = 'public';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('agendamentos', 'templates', 'configuracoes', 'envios_historico')
AND schemaname = 'public';
