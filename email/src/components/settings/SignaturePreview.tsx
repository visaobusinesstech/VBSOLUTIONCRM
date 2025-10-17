
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from '@/types/settings';

interface SignaturePreviewProps {
  settings: Settings;
  emailContent?: string;
  emailDescription?: string;
}

export function SignaturePreview({ 
  settings, 
  emailContent = "Conteúdo do email...", 
  emailDescription
}: SignaturePreviewProps) {
  const { smtp_nome, email_usuario, area_negocio, signature_image } = settings || {};
  
  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-6 bg-white text-black">
        <div className="space-y-4">
          <div className="border-b pb-2 mb-2">
            <div className="font-semibold">De: {smtp_nome || 'Seu Nome'}</div>
            <div>Para: destinatario@exemplo.com</div>
            <div>Assunto: {emailDescription || (emailContent ? emailContent.slice(0, 30) + (emailContent.length > 30 ? '...' : '') : 'Assunto do Email')}</div>
          </div>
          
          <div className="prose max-w-full mb-6">
            <div dangerouslySetInnerHTML={{ 
              __html: emailContent || `
                <p>Olá,</p>
                <p>Este é um exemplo de conteúdo do email que você está enviando.</p>
                <p>Atenciosamente,</p>
              ` 
            }} />
          </div>
          
          {/* CORREÇÃO: Assinatura digital automática no rodapé */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #e5e5e5', paddingTop: '20px' }}>
            <div style={{ textAlign: 'right' as const }}>
              <div className="text-sm mb-2">
                <div className="font-semibold">{smtp_nome || "Seu Nome"}</div>
                {area_negocio && <div className="text-gray-600">{area_negocio}</div>}
                {email_usuario && <div className="text-blue-600">{email_usuario}</div>}
              </div>
              
              {signature_image && (
                <div>
                  <img 
                    src={signature_image} 
                    alt="Assinatura Digital" 
                    style={{ 
                      maxWidth: '200px', 
                      height: 'auto',
                      marginLeft: 'auto',
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
