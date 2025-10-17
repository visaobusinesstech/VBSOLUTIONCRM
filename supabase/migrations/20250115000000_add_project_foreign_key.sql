-- Adicionar foreign key para project_id na tabela activities
-- Esta migração estabelece o relacionamento hierárquico entre projetos e atividades

-- Primeiro, verificar se a coluna project_id existe e adicionar se necessário
DO $$ 
BEGIN
    -- Verificar se a coluna project_id existe na tabela activities
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'project_id'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna project_id se não existir
        ALTER TABLE public.activities 
        ADD COLUMN project_id UUID;
    END IF;
END $$;

-- Adicionar foreign key constraint para project_id
-- Isso garante que project_id referencie um projeto válido
DO $$ 
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'activities_project_id_fkey'
        AND table_name = 'activities'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a foreign key constraint
        ALTER TABLE public.activities 
        ADD CONSTRAINT activities_project_id_fkey 
        FOREIGN KEY (project_id) 
        REFERENCES public.projects(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Adicionar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_activities_project_id 
ON public.activities(project_id);

-- Adicionar índice composto para consultas por projeto e status
CREATE INDEX IF NOT EXISTS idx_activities_project_status 
ON public.activities(project_id, status) 
WHERE project_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.activities.project_id IS 'Referência ao projeto ao qual esta atividade pertence. NULL significa que a atividade não está vinculada a nenhum projeto.';
