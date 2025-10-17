-- Script para criar os buckets de storage necessários para templates de email
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para imagens de templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-images', 'template-images', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para anexos de templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-attachments', 'template-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de acesso para template-images
-- Permitir que usuários autenticados façam upload
CREATE POLICY "Usuários podem fazer upload de imagens de templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-images');

-- Permitir que todos possam visualizar as imagens (público)
CREATE POLICY "Imagens de templates são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-images');

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Usuários podem deletar suas próprias imagens de templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-images' AND owner = auth.uid());

-- Configurar políticas de acesso para template-attachments
-- Permitir que usuários autenticados façam upload
CREATE POLICY "Usuários podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-attachments');

-- Permitir que todos possam visualizar os anexos (público)
CREATE POLICY "Anexos de templates são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-attachments');

-- Permitir que usuários deletem seus próprios anexos
CREATE POLICY "Usuários podem deletar seus próprios anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-attachments' AND owner = auth.uid());

