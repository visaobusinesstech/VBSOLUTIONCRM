-- Migração para renomear owner_id para created_by na tabela activities
-- Data: 2025-01-15
-- Problema: A coluna está como owner_id mas o código usa created_by

-- 1. Verificar se a coluna owner_id existe e renomear para created_by
DO $$ 
BEGIN
    -- Verificar se a coluna owner_id existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        -- Renomear owner_id para created_by
        ALTER TABLE public.activities 
        RENAME COLUMN owner_id TO created_by;
        
        RAISE NOTICE '✅ Coluna owner_id renomeada para created_by com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna owner_id não encontrada, provavelmente já foi renomeada';
    END IF;
    
    -- Verificar se a coluna created_by agora existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna created_by existe';
    ELSE
        RAISE NOTICE '❌ Coluna created_by não existe';
    END IF;
END $$;

-- 2. Atualizar índices se necessário
DROP INDEX IF EXISTS idx_activities_owner_id;
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON public.activities(created_by);

-- 3. Comentário explicativo
COMMENT ON COLUMN public.activities.created_by IS 'ID do usuário que criou a atividade (anteriormente owner_id)';

