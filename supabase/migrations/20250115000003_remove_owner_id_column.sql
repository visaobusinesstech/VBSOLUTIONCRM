-- Migração para remover a coluna owner_id da tabela activities (se existir)
-- Data: 2025-01-15
-- Problema: A coluna owner_id ainda existe junto com created_by

-- 1. Verificar se a coluna owner_id existe e removê-la
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
        -- Remover a coluna owner_id
        ALTER TABLE public.activities 
        DROP COLUMN owner_id;
        
        RAISE NOTICE '✅ Coluna owner_id removida com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna owner_id não encontrada, já foi removida';
    END IF;
    
    -- Verificar se a coluna created_by existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna created_by existe e está correta';
    ELSE
        RAISE NOTICE '❌ Coluna created_by não existe - ERRO!';
    END IF;
END $$;

-- 2. Remover índice da coluna owner_id se existir
DROP INDEX IF EXISTS idx_activities_owner_id;

-- 3. Garantir que o índice created_by existe
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON public.activities(created_by);

-- 4. Comentário explicativo
COMMENT ON COLUMN public.activities.created_by IS 'ID do usuário que criou a atividade';
