-- ========================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO
-- Templates de Email - VB Solution
-- ========================================

-- PASSO 1: Verificar e criar buckets de storage
-- ========================================

-- Criar bucket para imagens de templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-images', 'template-images', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para anexos de templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-attachments', 'template-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- PASSO 2: Configurar políticas de acesso
-- ========================================

-- Limpar políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens de templates" ON storage.objects;
DROP POLICY IF EXISTS "Imagens de templates são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias imagens de templates" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de anexos" ON storage.objects;
DROP POLICY IF EXISTS "Anexos de templates são públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios anexos" ON storage.objects;

-- Políticas para template-images
CREATE POLICY "Usuários podem fazer upload de imagens de templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-images');

CREATE POLICY "Imagens de templates são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-images');

CREATE POLICY "Usuários podem deletar suas próprias imagens de templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-images' AND owner = auth.uid());

-- Políticas para template-attachments
CREATE POLICY "Usuários podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-attachments');

CREATE POLICY "Anexos de templates são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-attachments');

CREATE POLICY "Usuários podem deletar seus próprios anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-attachments' AND owner = auth.uid());

-- PASSO 3: Verificar estrutura da tabela templates
-- ========================================

-- Verificar se a tabela templates existe e mostrar estrutura
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'templates'
    ) THEN
        RAISE NOTICE '✅ Tabela templates existe';
    ELSE
        RAISE NOTICE '❌ Tabela templates NÃO existe - será necessário criá-la';
    END IF;
END $$;

-- Verificar campos importantes
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'attachments') 
        THEN '✅ Campo attachments existe'
        ELSE '❌ Campo attachments NÃO existe'
    END as status_attachments,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'image_url') 
        THEN '✅ Campo image_url existe'
        ELSE '❌ Campo image_url NÃO existe'
    END as status_image_url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'signature_image') 
        THEN '✅ Campo signature_image existe'
        ELSE '❌ Campo signature_image NÃO existe'
    END as status_signature;

-- PASSO 4: Mostrar estrutura completa da tabela
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'templates'
ORDER BY ordinal_position;

-- PASSO 5: Verificar buckets criados
-- ========================================

SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
WHERE id IN ('template-images', 'template-attachments');

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Mensagem final
SELECT '✅ CONFIGURAÇÃO COMPLETA! Verifique os resultados acima.' as mensagem_final;

