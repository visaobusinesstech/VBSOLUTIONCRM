-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  smtp_host TEXT,
  smtp_pass TEXT,
  smtp_from_name TEXT,
  email_usuario TEXT,
  email_porta INTEGER DEFAULT 587,
  smtp_seguranca TEXT DEFAULT 'tls',
  signature_image TEXT,
  use_smtp BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Criar tabela de templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  canal TEXT DEFAULT 'email',
  assinatura TEXT,
  signature_image TEXT,
  attachments JSONB,
  image_url TEXT,
  font_size_px TEXT DEFAULT '16px',
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  contato_id UUID NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de histórico de envios
CREATE TABLE IF NOT EXISTS envios_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  contato_id UUID,
  remetente_nome TEXT NOT NULL,
  remetente_email TEXT NOT NULL,
  destinatario_nome TEXT NOT NULL,
  destinatario_email TEXT NOT NULL,
  status TEXT DEFAULT 'enviado',
  tipo_envio TEXT DEFAULT 'individual',
  mensagem_erro TEXT,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de logs detalhados de envio
CREATE TABLE IF NOT EXISTS envios_email (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  contato_id UUID,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  destinatario_email TEXT NOT NULL,
  destinatario_nome TEXT,
  assunto TEXT,
  status TEXT NOT NULL,
  mensagem_erro TEXT,
  duracao_envio_ms INTEGER,
  resposta_servidor JSONB,
  tipo_operacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_user_id ON configuracoes(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_id ON agendamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_envio ON agendamentos(data_envio);
CREATE INDEX IF NOT EXISTS idx_envios_historico_user_id ON envios_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_envios_email_user_id ON envios_email(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_email ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON configuracoes;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias configurações" ON configuracoes;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON configuracoes;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações" ON configuracoes;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios templates" ON templates;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios templates" ON templates;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios templates" ON templates;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios templates" ON templates;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios agendamentos" ON agendamentos;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON envios_historico;
DROP POLICY IF EXISTS "Usuários podem inserir em seu próprio histórico" ON envios_historico;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios logs" ON envios_email;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios logs" ON envios_email;

-- Políticas de segurança para configuracoes
CREATE POLICY "Usuários podem ver suas próprias configurações" ON configuracoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações" ON configuracoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações" ON configuracoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias configurações" ON configuracoes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para templates
CREATE POLICY "Usuários podem ver seus próprios templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para agendamentos
CREATE POLICY "Usuários podem ver seus próprios agendamentos" ON agendamentos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" ON agendamentos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios agendamentos" ON agendamentos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para envios_historico
CREATE POLICY "Usuários podem ver seu próprio histórico" ON envios_historico
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir em seu próprio histórico" ON envios_historico
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para envios_email
CREATE POLICY "Usuários podem ver seus próprios logs" ON envios_email
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios logs" ON envios_email
  FOR INSERT WITH CHECK (auth.uid() = user_id);

