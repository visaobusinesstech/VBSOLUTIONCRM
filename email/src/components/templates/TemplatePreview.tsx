
import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Template } from '@/types/template';
import { useSettings } from '@/hooks/useSettings';
import { useEmailSignature } from '@/hooks/useEmailSignature';
import { applyFontSizeToHtml, wrapHtmlWithFontSize } from '@/utils/fontSizeProcessor';

interface TemplatePreviewProps {
  template: Partial<Template>;
}

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { settings } = useSettings();
  const { getSignatureUrl } = useEmailSignature();
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
  // Add Google Fonts for preview consistency
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&display=swap';
    
    if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
      document.head.appendChild(fontLink);
    }
  }, []);
  
  // Load signature image on component mount
  useEffect(() => {
    const loadSignatureImage = async () => {
      // First try to use the settings signature image if available
      if (settings?.signature_image) {
        console.log("Using signature from settings:", settings.signature_image);
        setSignatureImage(settings.signature_image);
        return;
      }
      
      // If template has a specific signature image, use it
      if (template.signature_image && template.signature_image !== 'no_signature') {
        console.log("Using signature from template:", template.signature_image);
        setSignatureImage(template.signature_image);
        return;
      }
      
      // Try to fetch from Supabase if not available in settings
      const signatureUrl = await getSignatureUrl();
      if (signatureUrl) {
        console.log("Using signature from Supabase:", signatureUrl);
        setSignatureImage(signatureUrl);
      } else {
        console.log("No signature image available");
      }
    };
    
    loadSignatureImage();
  }, [settings, template, getSignatureUrl]);
  
  // Memoized content processing for better performance
  const processedContent = useMemo(() => {
    const content = template.conteudo || '';
    const fontSize = template.font_size_px || '16px';
    
    console.log('🎨 TemplatePreview: Processando conteúdo com font-size:', fontSize);
    
    // Substituir variáveis primeiro
    const contentWithVariables = content
      .replace(/\{\{nome\}\}/g, "Nome do Cliente")
      .replace(/\{\{email\}\}/g, "cliente@exemplo.com")
      .replace(/\{\{telefone\}\}/g, "(00) 00000-0000")
      .replace(/\{\{razao_social\}\}/g, "Empresa Exemplo")
      .replace(/\{\{cliente\}\}/g, "Cliente Exemplo")
      .replace(/\{\{empresa\}\}/g, "Empresa Exemplo")
      .replace(/\{\{cargo\}\}/g, "Cargo Exemplo")
      .replace(/\{\{produto\}\}/g, "Produto Exemplo")
      .replace(/\{\{valor\}\}/g, "R$ 1.000,00")
      .replace(/\{\{vencimento\}\}/g, "01/01/2025")
      .replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR'))
      .replace(/\{\{hora\}\}/g, new Date().toLocaleTimeString('pt-BR'));
    
    // Aplicar font-size ao HTML processado
    const contentWithFontSize = wrapHtmlWithFontSize(contentWithVariables, fontSize);
    
    console.log('✅ TemplatePreview: Conteúdo processado com font-size aplicado');
    return contentWithFontSize;
  }, [template.conteudo, template.font_size_px]);
  
  // Memoized attachments parsing
  const attachmentsList = useMemo(() => {
    if (!template.attachments) return [];
    
    try {
      let parsedAttachments = [];
      
      if (typeof template.attachments === 'string') {
        parsedAttachments = JSON.parse(template.attachments);
      } else if (Array.isArray(template.attachments)) {
        parsedAttachments = template.attachments;
      }
      
      return Array.isArray(parsedAttachments) ? parsedAttachments : [];
    } catch (e) {
      console.error('Erro ao processar anexos na preview:', e);
      return [];
    }
  }, [template.attachments]);
  
  // Render attachments component
  const renderAttachments = () => {
    if (attachmentsList.length === 0) return null;
    
    return (
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Anexos ({attachmentsList.length}):</h4>
        <ul className="space-y-1">
          {attachmentsList.map((attachment: any, index: number) => (
            <li key={index} className="flex items-center text-sm">
              <span className="inline-flex items-center">
                📎 {attachment.name || attachment.file_name || 'Arquivo'}
                {attachment.size && ` (${(attachment.size / 1024).toFixed(1)} KB)`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Get the font size to apply
  const fontSize = template.font_size_px || '16px';
  console.log('🎨 TemplatePreview: Font-size selecionado:', fontSize);
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">{template.nome || 'Preview do Template'}</h3>
        
        {/* Display description if present */}
        {template.descricao && (
          <div className="text-sm text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-3 my-2">
            {template.descricao}
          </div>
        )}
        
        {/* Font size indicator */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          📏 Tamanho da fonte: {fontSize}
        </div>
        
        {/* Display image at the top if present */}
        {template.image_url && (
          <div className="mb-4">
            <img 
              src={template.image_url} 
              alt="Imagem do template" 
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}
        
        {/* Main content with font-size applied via HTML processing */}
        <div 
          className="prose max-w-none template-preview-content"
          dir="ltr"
          style={{ 
            direction: 'ltr', 
            textAlign: 'left',
            fontFamily: 'inherit',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ 
            __html: processedContent || '<p class="text-muted-foreground italic">Sem conteúdo</p>'
          }} 
        />
        
        {/* Display attachments if present */}
        {renderAttachments()}
        
        {/* Display signature if present - Always at the end */}
        {signatureImage && (
          <div className="pt-4 border-t mt-6">
            <p className="text-sm text-muted-foreground mb-2">Assinatura:</p>
            <img 
              src={signatureImage} 
              alt="Assinatura" 
              className="max-h-24" 
              style={{ maxWidth: '100%' }}
              onError={(e) => {
                console.error("Error loading signature image:", e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
