-- CORRIGIR CONSTRAINT DE owner_id
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Tornar owner_id opcional temporariamente
ALTER TABLE public.products ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.inventory ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Atualizar registros existentes com owner_id do usuário atual
UPDATE public.products 
SET owner_id = auth.uid() 
WHERE owner_id IS NULL;

UPDATE public.inventory 
SET owner_id = auth.uid() 
WHERE owner_id IS NULL;

-- 3. Verificar se as colunas foram alteradas
SELECT 
    table_name, 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('products', 'inventory') 
AND column_name = 'owner_id';

-- 4. Testar inserção sem owner_id
INSERT INTO public.products (name, sku, category, base_price, min_stock, type, stock)
VALUES ('Teste Sem Owner', 'TEST-NO-OWNER', 'Teste', 99.99, 5, 'product', 10)
RETURNING *;
