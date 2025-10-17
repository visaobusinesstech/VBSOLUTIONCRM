-- Script para atualizar a tabela templates com novos campos
-- Execute este script no Supabase SQL Editor se os campos não existirem

-- Adicionar campo custom_variables se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' 
        AND column_name = 'custom_variables'
    ) THEN
        ALTER TABLE templates ADD COLUMN custom_variables JSONB;
    END IF;
END $$;

-- Verificar se todos os campos existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'templates' 
ORDER BY ordinal_position;
