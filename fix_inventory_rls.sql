-- Script para corrigir políticas RLS das tabelas de inventário
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se as tabelas existem
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('products', 'inventory') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Desabilitar RLS temporariamente para correção
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can create their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to inventory" ON public.inventory;
DROP POLICY IF EXISTS "company_isolation_products" ON public.products;
DROP POLICY IF EXISTS "company_isolation_inventory" ON public.inventory;
DROP POLICY IF EXISTS "Isolamento por empresa - products" ON public.products;
DROP POLICY IF EXISTS "Isolamento por empresa - inventory" ON public.inventory;

-- 4. Adicionar coluna owner_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.inventory ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 5. Criar função auxiliar para obter owner_id
CREATE OR REPLACE FUNCTION get_user_owner_id()
RETURNS UUID AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Busca no profiles
  SELECT owner_id INTO v_owner_id
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Se não encontrar, busca no company_users
  IF v_owner_id IS NULL THEN
    SELECT owner_id INTO v_owner_id
    FROM company_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrar, usar o próprio auth.uid()
  IF v_owner_id IS NULL THEN
    v_owner_id := auth.uid();
  END IF;
  
  RETURN v_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON public.products(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_owner_id ON public.inventory(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_id ON public.products(id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);

-- 7. Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para products
CREATE POLICY "Users can view their own products" ON public.products
  FOR SELECT USING (owner_id = get_user_owner_id());

CREATE POLICY "Users can create their own products" ON public.products
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());

CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (owner_id = get_user_owner_id());

CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (owner_id = get_user_owner_id());

-- 9. Criar políticas RLS para inventory
CREATE POLICY "Users can view their own inventory" ON public.inventory
  FOR SELECT USING (owner_id = get_user_owner_id());

CREATE POLICY "Users can create their own inventory" ON public.inventory
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());

CREATE POLICY "Users can update their own inventory" ON public.inventory
  FOR UPDATE USING (owner_id = get_user_owner_id());

CREATE POLICY "Users can delete their own inventory" ON public.inventory
  FOR DELETE USING (owner_id = get_user_owner_id());

-- 10. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('products', 'inventory')
ORDER BY tablename, policyname;

-- 11. Testar a função
SELECT get_user_owner_id() as current_owner_id;
