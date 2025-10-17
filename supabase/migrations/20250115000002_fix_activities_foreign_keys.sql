-- Corrigir foreign keys da tabela activities para usar a tabela profiles
-- Data: 2025-01-15
-- Problema: A tabela activities está referenciando user_profiles, mas o sistema usa profiles
-- Solução: Alterar as foreign keys para referenciar a tabela profiles

-- 1. Remover as foreign keys existentes
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_created_by_fkey;
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_responsible_id_fkey;

-- 2. Adicionar as foreign keys corretas para a tabela profiles
ALTER TABLE public.activities 
ADD CONSTRAINT activities_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public.activities 
ADD CONSTRAINT activities_responsible_id_fkey 
FOREIGN KEY (responsible_id) REFERENCES public.profiles(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Adicionar foreign key para project_id se não existir
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

-- 4. Comentário explicativo
COMMENT ON COLUMN public.activities.created_by IS 'Referência ao usuário que criou a atividade na tabela profiles';
COMMENT ON COLUMN public.activities.responsible_id IS 'Referência ao usuário responsável pela atividade na tabela profiles';
COMMENT ON COLUMN public.activities.project_id IS 'Referência ao projeto ao qual esta atividade pertence';
