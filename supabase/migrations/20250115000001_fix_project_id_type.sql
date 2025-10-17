-- Corrigir o tipo da coluna project_id na tabela activities
-- Data: 2025-01-15
-- Problema: project_id está como VARCHAR(255) mas deveria ser UUID
-- Solução: Alterar o tipo para UUID e adicionar foreign key

-- 1. Primeiro, remover a foreign key existente se houver
DO $$ 
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'activities_project_id_fkey'
        AND table_name = 'activities'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.activities 
        DROP CONSTRAINT activities_project_id_fkey;
    END IF;
END $$;

-- 2. Limpar dados inválidos (se houver)
UPDATE public.activities 
SET project_id = NULL 
WHERE project_id IS NOT NULL 
AND project_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 3. Alterar o tipo da coluna para UUID
ALTER TABLE public.activities 
ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

-- 4. Adicionar a foreign key constraint
ALTER TABLE public.activities 
ADD CONSTRAINT activities_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id) 
ON DELETE SET NULL;

-- 5. Recriar o índice
DROP INDEX IF EXISTS idx_activities_project_id;
CREATE INDEX IF NOT EXISTS idx_activities_project_id 
ON public.activities(project_id);

-- 6. Adicionar índice composto para consultas por projeto e status
CREATE INDEX IF NOT EXISTS idx_activities_project_status 
ON public.activities(project_id, status) 
WHERE project_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.activities.project_id IS 'Referência ao projeto ao qual esta atividade pertence. NULL significa que a atividade não está vinculada a nenhum projeto.';
