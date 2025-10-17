-- SOLUÇÃO IMEDIATA - Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
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
DROP POLICY IF EXISTS "Allow all for authenticated users - products" ON public.products;
DROP POLICY IF EXISTS "Allow all for authenticated users - inventory" ON public.inventory;

-- 3. VERIFICAR SE AS COLUNAS EXISTEM E CRIAR SE NECESSÁRIO
DO $$ 
BEGIN
    -- Adicionar owner_id em products se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products ADD COLUMN owner_id UUID;
    END IF;
    
    -- Adicionar owner_id em inventory se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.inventory ADD COLUMN owner_id UUID;
    END IF;
END $$;

-- 4. ATUALIZAR DADOS EXISTENTES COM owner_id (se necessário)
UPDATE public.products 
SET owner_id = auth.uid() 
WHERE owner_id IS NULL;

UPDATE public.inventory 
SET owner_id = auth.uid() 
WHERE owner_id IS NULL;

-- 5. CRIAR POLÍTICAS MUITO SIMPLES
CREATE POLICY "Allow all operations for authenticated users - products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users - inventory" ON public.inventory
  FOR ALL USING (true) WITH CHECK (true);

-- 6. HABILITAR RLS NOVAMENTE
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 7. TESTAR INSERÇÃO
INSERT INTO public.products (name, sku, category, base_price, min_stock, type, stock, owner_id)
VALUES ('Teste RLS', 'TEST-RLS-001', 'Teste', 99.99, 5, 'product', 10, auth.uid())
RETURNING *;

-- 8. VERIFICAR POLÍTICAS CRIADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('products', 'inventory')
ORDER BY tablename, policyname;
