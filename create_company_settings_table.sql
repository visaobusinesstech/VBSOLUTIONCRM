-- CRIAR TABELA COMPANY_SETTINGS SE NÃO EXISTIR
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'company_settings' 
            AND table_schema = 'public'
        ) THEN 'Tabela company_settings existe'
        ELSE 'Tabela company_settings NÃO existe'
    END as table_status;

-- 2. CRIAR TABELA SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
    company_name TEXT,
    default_language TEXT DEFAULT 'pt-BR',
    default_timezone TEXT DEFAULT 'America/Sao_Paulo',
    default_currency TEXT DEFAULT 'BRL',
    datetime_format TEXT DEFAULT 'DD/MM/YYYY HH:mm',
    logo_url TEXT DEFAULT 'https://i.imgur.com/KdKLVUV.png',
    primary_color TEXT DEFAULT '#021529',
    secondary_color TEXT DEFAULT '#ffffff',
    accent_color TEXT DEFAULT '#3b82f6',
    sidebar_color TEXT DEFAULT '#FFFFFF',
    topbar_color TEXT DEFAULT '#1e293b',
    button_color TEXT DEFAULT '#4A5477',
    enable_2fa BOOLEAN DEFAULT false,
    password_policy JSONB DEFAULT '{"min_length": 8, "require_numbers": true, "require_uppercase": true, "require_special": true}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. HABILITAR RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICA SIMPLES
CREATE POLICY "Allow all for authenticated users - company_settings" ON public.company_settings
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. TESTAR INSERÇÃO DE EMPRESA
INSERT INTO public.companies (
    fantasy_name, 
    company_name, 
    email, 
    status, 
    owner_id
) VALUES (
    'Teste Company Settings ' || extract(epoch from now()), 
    'Teste Company Settings LTDA', 
    'teste@companysettings.com', 
    'active', 
    auth.uid()
) RETURNING *;
