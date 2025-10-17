-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR PROBLEMAS DE LOGIN
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO COMPANY_USERS
SELECT 
  'COMPANY_USERS' as tabela,
  id,
  email,
  full_name,
  company_name,
  role,
  status,
  created_at
FROM company_users
ORDER BY created_at DESC;

-- 2. VERIFICAR SE O USUÁRIO EXISTE NO AUTH.USERS
SELECT 
  'AUTH.USERS' as tabela,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. VERIFICAR SE O USUÁRIO EXISTE NO PROFILES
SELECT 
  'PROFILES' as tabela,
  id,
  email,
  name,
  company,
  owner_id,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- SOLUÇÃO 1: SE O USUÁRIO EXISTE EM COMPANY_USERS MAS NÃO EM AUTH.USERS
-- =====================================================
-- Você precisa:
-- 1. Ir em Authentication > Users no Supabase Dashboard
-- 2. Clicar em "Add user" > "Create new user"
-- 3. Cadastrar com o MESMO email que está em company_users
-- 4. Marcar "Auto Confirm User" para pular confirmação de email
-- 5. Definir uma senha

-- OU usar este script para criar o usuário manualmente:
-- IMPORTANTE: Substitua 'SEU_EMAIL_AQUI' e 'SUA_SENHA_AQUI'

-- Descomente as linhas abaixo e ajuste os dados:
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) 
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'SEU_EMAIL_AQUI',
  crypt('SUA_SENHA_AQUI', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('name', full_name, 'company', company_name),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
FROM company_users
WHERE email = 'SEU_EMAIL_AQUI'
AND NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');
*/

-- =====================================================
-- SOLUÇÃO 2: SE O USUÁRIO EXISTE EM AUTH.USERS MAS EMAIL NÃO FOI CONFIRMADO
-- =====================================================
-- Confirmar email manualmente:
-- Substitua 'SEU_EMAIL_AQUI' pelo seu email

-- Descomente a linha abaixo:
/*
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'SEU_EMAIL_AQUI' 
  AND email_confirmed_at IS NULL;
*/

-- =====================================================
-- SOLUÇÃO 3: RESETAR SENHA DO USUÁRIO
-- =====================================================
-- Se você esqueceu a senha, pode resetar:
-- Substitua 'SEU_EMAIL_AQUI' e 'NOVA_SENHA_AQUI'

-- Descomente a linha abaixo:
/*
UPDATE auth.users 
SET encrypted_password = crypt('NOVA_SENHA_AQUI', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'SEU_EMAIL_AQUI';
*/

-- =====================================================
-- SOLUÇÃO 4: CRIAR PERFIL SE NÃO EXISTIR
-- =====================================================
-- Se o usuário existe em auth.users e company_users, mas não em profiles:

-- Descomente as linhas abaixo e ajuste 'SEU_EMAIL_AQUI':
/*
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
WHERE au.email = 'SEU_EMAIL_AQUI'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = au.id);
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute esta query para ver se está tudo OK:

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM company_users WHERE email = 'SEU_EMAIL_AQUI') THEN '✅'
    ELSE '❌'
  END as "Company Users",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'SEU_EMAIL_AQUI') THEN '✅'
    ELSE '❌'
  END as "Auth Users",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'SEU_EMAIL_AQUI' AND email_confirmed_at IS NOT NULL) THEN '✅'
    ELSE '❌'
  END as "Email Confirmado",
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'SEU_EMAIL_AQUI') THEN '✅'
    ELSE '❌'
  END as "Profiles";

