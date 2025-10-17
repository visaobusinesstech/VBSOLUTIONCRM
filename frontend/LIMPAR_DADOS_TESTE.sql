-- =====================================================
-- SCRIPT PARA LIMPAR DADOS DE TESTE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- ⚠️ ATENÇÃO: Este script vai DELETAR todos os dados de teste
-- Use apenas em ambiente de desenvolvimento!

-- 1. Desabilitar temporariamente as políticas RLS para limpeza
ALTER TABLE IF EXISTS company_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 2. Deletar dados das tabelas (mantém a estrutura)
DELETE FROM company_users;
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@%'
);

-- 3. Limpar usuários do auth (CUIDADO: vai deletar TODOS os usuários)
-- Descomente a linha abaixo se quiser deletar usuários de autenticação também
-- DELETE FROM auth.users;

-- 4. Reabilitar as políticas RLS
ALTER TABLE IF EXISTS company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- 5. Resetar sequences (IDs começam do 1 novamente)
-- Descomente se quiser resetar os IDs
-- ALTER SEQUENCE IF EXISTS company_users_id_seq RESTART WITH 1;

SELECT 'Dados de teste limpos com sucesso!' as resultado;

-- =====================================================
-- VERIFICAR O QUE FOI DELETADO
-- =====================================================

SELECT 
  'company_users' as tabela,
  COUNT(*) as total_registros
FROM company_users

UNION ALL

SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM profiles

UNION ALL

SELECT 
  'auth.users' as tabela,
  COUNT(*) as total_registros
FROM auth.users;

