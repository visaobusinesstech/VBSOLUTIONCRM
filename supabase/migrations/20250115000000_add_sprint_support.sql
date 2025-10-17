-- Adicionar suporte completo para Sprints
-- Migration criada em 2025-01-15

-- 1. Ajustar tabela de sprints para seguir o padrão do sistema
ALTER TABLE IF EXISTS public.sprints
  DROP COLUMN IF EXISTS project_id,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS status;

-- 2. Adicionar colunas corretas conforme requisitos
ALTER TABLE public.sprints
  ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT 'Nova Sprint',
  ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS data_fim TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'finalizada')),
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- 3. Adicionar campo sprint_id na tabela activities
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sprints_owner_id ON public.sprints(owner_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_company_id ON public.sprints(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_sprint_id ON public.activities(sprint_id);

-- 5. Adicionar RLS (Row Level Security) para sprints
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Política para leitura (SELECT)
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias sprints"
  ON public.sprints
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Política para inserção (INSERT)
CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias sprints"
  ON public.sprints
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Política para atualização (UPDATE)
CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias sprints"
  ON public.sprints
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Política para exclusão (DELETE)
CREATE POLICY IF NOT EXISTS "Usuários podem deletar suas próprias sprints"
  ON public.sprints
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 6. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_sprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION update_sprints_updated_at();

-- 7. Comentários nas colunas para documentação
COMMENT ON TABLE public.sprints IS 'Tabela para gerenciamento de Sprints do sistema de CRM';
COMMENT ON COLUMN public.sprints.nome IS 'Nome da Sprint';
COMMENT ON COLUMN public.sprints.data_inicio IS 'Data de início da Sprint';
COMMENT ON COLUMN public.sprints.data_fim IS 'Data de finalização da Sprint (null se em andamento)';
COMMENT ON COLUMN public.sprints.status IS 'Status da Sprint: em_andamento ou finalizada';
COMMENT ON COLUMN public.activities.sprint_id IS 'ID da Sprint à qual a atividade pertence';

