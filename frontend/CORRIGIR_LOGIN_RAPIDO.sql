-- =====================================================
-- CORREÇÃO RÁPIDA DE LOGIN
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- ⚠️ INSTRUÇÕES:
-- 1. Substitua 'SEU_EMAIL@EXEMPLO.COM' pelo seu email
-- 2. Substitua 'SUA_SENHA_123' pela senha que você quer usar
-- 3. Execute o script completo

-- =====================================================
-- PASSO 1: CONFIRMAR EMAIL (se já existe no auth)
-- =====================================================
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'SEU_EMAIL@EXEMPLO.COM' 
  AND email_confirmed_at IS NULL;

-- =====================================================
-- PASSO 2: RESETAR SENHA (se esqueceu)
-- =====================================================
UPDATE auth.users 
SET encrypted_password = crypt('SUA_SENHA_123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'SEU_EMAIL@EXEMPLO.COM';

-- =====================================================
-- PASSO 3: CRIAR PERFIL SE NÃO EXISTIR
-- =====================================================
INSERT INTO profiles (id, email, name, company, owner_id, phone, position)
SELECT 
  au.id,
  au.email,
  cu.full_name,
  cu.company_name,
  cu.owner_id,
  cu.phone,
  cu.position
FROM auth.users au
JOIN company_users cu ON au.email = cu.email
WHERE au.email = 'SEU_EMAIL@EXEMPLO.COM'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = au.id)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO: Mostrar status do usuário
-- =====================================================
SELECT 
  '🔍 STATUS DO USUÁRIO' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'SEU_EMAIL@EXEMPLO.COM' AND email_confirmed_at IS NOT NULL) 
    THEN '✅ Email confirmado - PODE FAZER LOGIN'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'SEU_EMAIL@EXEMPLO.COM' AND email_confirmed_at IS NULL)
    THEN '❌ Email NÃO confirmado - Execute o script novamente'
    ELSE '❌ Usuário NÃO existe no auth.users'
  END as status_login,
  
  (SELECT email FROM auth.users WHERE email = 'SEU_EMAIL@EXEMPLO.COM') as email,
  (SELECT email_confirmed_at FROM auth.users WHERE email = 'SEU_EMAIL@EXEMPLO.COM') as email_confirmado_em,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'SEU_EMAIL@EXEMPLO.COM')
    THEN '✅ Perfil existe'
    ELSE '❌ Perfil NÃO existe'
  END as status_profile;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Email confirmado - PODE FAZER LOGIN
-- ✅ Perfil existe
-- =====================================================

