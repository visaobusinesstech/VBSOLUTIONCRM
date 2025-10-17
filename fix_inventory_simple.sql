-- Script simples para corrigir problemas de RLS no inventário
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
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

-- 3. Adicionar coluna owner_id se não existir
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

-- 4. Criar políticas simples que permitem tudo para usuários autenticados
CREATE POLICY "Allow all for authenticated users - products" ON public.products
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users - inventory" ON public.inventory
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('products', 'inventory')
ORDER BY tablename, policyname;

-- 7. Testar se consegue inserir dados
INSERT INTO public.products (name, sku, category, base_price, min_stock, type, stock)
VALUES ('Produto Teste', 'TEST-001', 'Teste', 99.99, 5, 'product', 10)
RETURNING *;
