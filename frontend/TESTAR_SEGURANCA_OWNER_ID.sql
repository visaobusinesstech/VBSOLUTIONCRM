-- =====================================================
-- TESTAR SEGURANÇA COM OWNER_ID
-- Execute este script para verificar se está tudo OK
-- =====================================================

-- 1. VERIFICAR SE TODAS AS TABELAS TÊM OWNER_ID
SELECT 
  '📊 VERIFICAÇÃO DE COLUNAS OWNER_ID' as titulo;

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = t.table_name 
        AND column_name = 'owner_id'
    ) THEN '✅ Tem owner_id'
    ELSE '❌ Falta owner_id'
  END as status_owner_id
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN ('schema_migrations', 'spatial_ref_sys')
ORDER BY table_name;

-- =====================================================

-- 2. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
  '🔒 VERIFICAÇÃO DE RLS (ROW LEVEL SECURITY)' as titulo;

SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ATIVO' ELSE '⚠️ RLS INATIVO' END as status_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
ORDER BY tablename;

-- =====================================================

-- 3. VERIFICAR POLÍTICAS RLS CRIADAS
SELECT 
  '📜 POLÍTICAS RLS CRIADAS' as titulo;

SELECT 
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN '👁️ SELECT'
    WHEN 'a' THEN '➕ INSERT'
    WHEN 'w' THEN '✏️ UPDATE'
    WHEN 'd' THEN '🗑️ DELETE'
    ELSE cmd
  END as operacao,
  CASE permissive
    WHEN 'PERMISSIVE' THEN '✅ Permissivo'
    WHEN 'RESTRICTIVE' THEN '⚠️ Restritivo'
  END as tipo
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, operacao;

-- =====================================================

-- 4. VERIFICAR ÍNDICES CRIADOS
SELECT 
  '⚡ ÍNDICES DE PERFORMANCE' as titulo;

SELECT 
  tablename,
  indexname,
  CASE 
    WHEN indexname LIKE '%owner_id%' THEN '✅ Índice owner_id'
    WHEN indexname LIKE '%email%' THEN '📧 Índice email'
    WHEN indexname LIKE '%unique%' THEN '🔑 Índice único'
    ELSE '📊 Outro índice'
  END as tipo
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%owner%' 
   OR indexname LIKE '%email%'
   OR indexname LIKE '%unique%company%'
ORDER BY tablename;

-- =====================================================

-- 5. VERIFICAR CONSTRAINTS DE UNICIDADE
SELECT 
  '🔑 CONSTRAINTS DE UNICIDADE' as titulo;

SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  CASE tc.constraint_type
    WHEN 'UNIQUE' THEN '✅ Único'
    WHEN 'PRIMARY KEY' THEN '🔑 Chave primária'
    WHEN 'FOREIGN KEY' THEN '🔗 Chave estrangeira'
  END as tipo
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND (kcu.column_name LIKE '%owner%' 
    OR kcu.column_name LIKE '%company%'
    OR tc.constraint_name LIKE '%unique%company%')
ORDER BY tc.table_name;

-- =====================================================

-- 6. TESTAR FUNÇÃO get_user_owner_id()
SELECT 
  '🔍 TESTAR FUNÇÃO get_user_owner_id()' as titulo;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'get_user_owner_id'
    ) THEN '✅ Função existe'
    ELSE '❌ Função NÃO existe'
  END as status_funcao;

-- =====================================================

-- 7. VERIFICAR DADOS DE TESTE
SELECT 
  '📋 DADOS DE TESTE - COMPANY_USERS' as titulo;

SELECT 
  email,
  company_name,
  owner_id,
  role,
  status,
  CASE 
    WHEN owner_id IS NOT NULL THEN '✅ Tem owner_id'
    ELSE '❌ Falta owner_id'
  END as status_owner
FROM company_users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================

-- 8. VERIFICAR DADOS DE TESTE - PROFILES
SELECT 
  '📋 DADOS DE TESTE - PROFILES' as titulo;

SELECT 
  email,
  name,
  company,
  owner_id,
  CASE 
    WHEN owner_id IS NOT NULL THEN '✅ Tem owner_id'
    ELSE '❌ Falta owner_id'
  END as status_owner
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================

-- 9. CONTAR REGISTROS POR EMPRESA
SELECT 
  '📊 ESTATÍSTICAS POR EMPRESA' as titulo;

SELECT 
  cu.company_name,
  cu.owner_id,
  COUNT(DISTINCT p.id) as total_usuarios,
  (SELECT COUNT(*) FROM contacts WHERE owner_id = cu.owner_id) as total_contatos,
  (SELECT COUNT(*) FROM products WHERE owner_id = cu.owner_id) as total_produtos,
  (SELECT COUNT(*) FROM projects WHERE owner_id = cu.owner_id) as total_projetos
FROM company_users cu
LEFT JOIN profiles p ON p.owner_id = cu.owner_id
WHERE cu.role = 'admin'
GROUP BY cu.company_name, cu.owner_id;

-- =====================================================

-- 10. VERIFICAR DUPLICIDADES
SELECT 
  '⚠️ VERIFICAR DUPLICIDADES' as titulo;

-- Verificar owner_id duplicados para admins
SELECT 
  'Owner ID duplicado' as tipo,
  owner_id,
  COUNT(*) as quantidade
FROM company_users
WHERE role = 'admin'
GROUP BY owner_id
HAVING COUNT(*) > 1

UNION ALL

-- Verificar nomes de empresa duplicados
SELECT 
  'Nome empresa duplicado' as tipo,
  company_name as owner_id,
  COUNT(*) as quantidade
FROM company_users
GROUP BY company_name
HAVING COUNT(*) > 1;

-- =====================================================

-- RESULTADO FINAL
SELECT 
  '✅ VERIFICAÇÃO COMPLETA!' as resultado,
  'Se todas as verificações acima mostraram ✅, o sistema está seguro!' as status;

