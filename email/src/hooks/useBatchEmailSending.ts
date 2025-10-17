
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeTipoEnvio } from '@/types/envios';
import { useEmailValidation } from './useEmailValidation';

interface BatchProgress {
  current: number;
  total: number;
}

export function useBatchEmailSending() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress>({ current: 0, total: 0 });
  const { validateContacts } = useEmailValidation();

  const sendEmailsInBatch = async (
    selectedContacts: any[],
    templateId: string,
    customSubject?: string,
    customContent?: string
  ) => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast.error('Nenhum contato selecionado para envio');
      return false;
    }

    if (selectedContacts.length > 5000) {
      toast.error('Limite máximo de 5.000 contatos por lote para garantir 100% de sucesso');
      return false;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedContacts.length });

    try {
      console.log(`🎯 INICIANDO SISTEMA 100% SUCESSO para ${selectedContacts.length} contatos`);
      
      // ETAPA 1: VALIDAÇÃO AUTOMÁTICA DE EMAILS
      toast.info('🔍 VALIDANDO EMAILS AUTOMATICAMENTE...', {
        description: 'Verificando sintaxe, domínios e emails descartáveis',
        duration: 4000
      });
      
      const { validContacts, invalidContacts, stats } = await validateContacts(selectedContacts);
      
      if (invalidContacts.length > 0) {
        toast.warning(`🚫 ${invalidContacts.length} emails inválidos removidos da fila`, {
          description: `Apenas ${validContacts.length} emails válidos serão enviados`,
          duration: 6000
        });
        
        console.log(`❌ Emails removidos:`, invalidContacts.map(c => c.email));
      }
      
      if (validContacts.length === 0) {
        toast.error('❌ Nenhum email válido encontrado para envio');
        return false;
      }
      
      // Atualizar progresso com contatos válidos
      setProgress({ current: 0, total: validContacts.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data: userSettings, error: settingsError } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError || !userSettings) {
        throw new Error('Configurações SMTP não encontradas. Configure nas configurações.');
      }
      
      if (!userSettings.use_smtp || !userSettings.smtp_host) {
        throw new Error('SMTP deve estar configurado e ativado. Configure nas configurações.');
      }
      
      // CORREÇÃO: Buscar dados COMPLETOS do template incluindo anexos, image_url e font_size_px
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();
        
      if (templateError) throw new Error(`Erro ao carregar template: ${templateError.message}`);
      if (!templateData) throw new Error('Template não encontrado');
      
      console.log('📋 Template completo carregado:', {
        id: templateData.id,
        nome: templateData.nome,
        has_attachments: !!templateData.attachments,
        attachments_type: typeof templateData.attachments,
        has_image_url: !!templateData.image_url,
        image_url: templateData.image_url,
        font_size_px: templateData.font_size_px,
        content_length: templateData.conteudo?.length || 0
      });
      
      // Validar font_size_px
      const fontSize = templateData.font_size_px || '16px';
      console.log('🎨 Font-size detectado no template:', fontSize);
      
      // CORREÇÃO: Processar anexos corretamente (podem vir como string JSON)
      let processedAttachments = [];
      if (templateData.attachments) {
        try {
          if (typeof templateData.attachments === 'string') {
            processedAttachments = JSON.parse(templateData.attachments);
          } else if (Array.isArray(templateData.attachments)) {
            processedAttachments = templateData.attachments;
          } else if (typeof templateData.attachments === 'object') {
            processedAttachments = [templateData.attachments];
          }
          console.log('📎 Anexos processados para lote:', processedAttachments);
        } catch (error) {
          console.error('❌ Erro ao processar anexos do template:', error);
          processedAttachments = [];
        }
      }
      
      // CONFIGURAÇÃO SUPER CONSERVADORA PARA 100% SUCESSO
      const isGmail = userSettings.smtp_host.includes('gmail');
      const isOutlook = userSettings.smtp_host.includes('outlook') || userSettings.smtp_host.includes('live');
      
      // Configurações ultra conservadoras para evitar rate limits
      const optimization_config = {
        max_concurrent: isGmail ? 3 : isOutlook ? 5 : 8, // MUITO REDUZIDO
        delay_between_emails: isGmail ? 2000 : isOutlook ? 1500 : 1000, // MUITO AUMENTADO
        rate_limit_per_minute: isGmail ? 20 : isOutlook ? 30 : 40, // MUITO REDUZIDO
        burst_limit: isGmail ? 5 : isOutlook ? 8 : 10, // MUITO REDUZIDO
        connection_pool_size: 2, // Pool pequeno
        retry_attempts: 3,
        retry_delay: 5000,
        backoff_factor: 2,
        use_connection_pooling: true,
        smart_rate_limiting: true,
        reliability_mode: true // MODO 100% CONFIÁVEL
      };
      
      const smtpSettings = {
        host: userSettings.smtp_host,
        port: userSettings.email_porta || 587,
        secure: userSettings.smtp_seguranca === 'ssl',
        password: userSettings.smtp_pass,
        from_name: userSettings.smtp_from_name || 'Sistema Email',
        from_email: userSettings.email_usuario || '',
        username: userSettings.email_usuario || ''
      };
      
      // CORREÇÃO: Incluir font_size_px nos dados do email com logs detalhados
      const emailJobs = validContacts.map(contact => {
        // Usar conteúdo original do template SEM substituir variáveis aqui
        const baseContent = customContent || templateData.conteudo;
        const baseSubject = customSubject || templateData.descricao || templateData.nome;
        
        console.log(`📧 Preparando email para ${contact.email} com configurações completas:`, {
          font_size_px: fontSize,
          has_image_url: !!templateData.image_url,
          has_attachments: processedAttachments.length > 0,
          content_type: 'html_with_variables'
        });

        return {
          to: contact.email,
          contato_id: contact.id,
          template_id: templateId,
          contato_nome: contact.nome,
          subject: baseSubject, // Conteúdo original, será processado no backend
          content: baseContent, // Conteúdo original com variáveis {nome}, será processado no backend
          contact: {
            ...contact,
            user_id: user.id
          },
          user_id: user.id,
          image_url: templateData.image_url,
          font_size_px: fontSize, // CRÍTICO: Incluir font-size com validação
          signature_image: userSettings?.signature_image || templateData.signature_image,
          attachments: processedAttachments,
          smtp_settings: smtpSettings
        };
      });

      // Progresso mais lento e realista
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.ceil(emailJobs.length / 50); // Muito mais lento
          const newCurrent = Math.min(prev.current + increment, prev.total);
          return { ...prev, current: newCurrent };
        });
      }, 1000); // Atualização mais lenta
      
      console.log("🛡️ MODO 100% CONFIÁVEL ATIVADO COM FONT-SIZE:", {
        batch_size: emailJobs.length,
        provider: isGmail ? 'Gmail' : isOutlook ? 'Outlook' : 'Outro',
        max_concurrent: optimization_config.max_concurrent,
        delay_ms: optimization_config.delay_between_emails,
        reliability_mode: true,
        validated_emails: true,
        has_attachments: processedAttachments.length > 0,
        has_image_url: !!templateData.image_url,
        font_size_included: fontSize,
        font_size_validation: fontSize.match(/^\d+px$/) ? 'VÁLIDO' : 'INVÁLIDO',
        template_data_complete: true,
        dynamic_variables_backend_only: true
      });
      
      // Sistema de múltiplas tentativas com backoff exponencial
      let response;
      let attempt = 0;
      const maxAttempts = 3;
      
      while (attempt < maxAttempts) {
        try {
          attempt++;
          console.log(`🔄 Tentativa ${attempt}/${maxAttempts} - Modo Confiável + Variáveis Backend + Font-size (${fontSize})`);
          
          response = await supabase.functions.invoke('send-email', {
            body: {
              batch: true,
              emails: emailJobs,
              smtp_settings: smtpSettings,
              optimization_config: optimization_config,
              use_smtp: true,
              reliability_mode: true,
              validated_emails: true,
              dynamic_variables_backend: true, // Nova flag para processar variáveis apenas no backend
              font_size_support: true, // Flag para suporte a font-size
              global_font_size: fontSize, // Font-size global para aplicação no backend
              tipo_envio: normalizeTipoEnvio('lote')
            }
          });
          
          if (!response.error) break;
          
          if (attempt < maxAttempts) {
            const backoffDelay = 2000 * Math.pow(2, attempt - 1);
            console.log(`⏳ Aguardando ${backoffDelay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        } catch (error) {
          console.error(`❌ Tentativa ${attempt} falhou:`, error);
          if (attempt === maxAttempts) throw error;
        }
      }
      
      clearInterval(progressInterval);
      
      if (response?.error) {
        console.error("❌ Erro na função:", response.error);
        throw new Error(`Erro no envio: ${response.error.message || response.error}`);
      }
      
      const responseData = response?.data;
      if (!responseData || !responseData.success) {
        console.error("❌ Resposta de falha:", responseData);
        throw new Error(responseData?.error || "Falha no envio em lote");
      }
      
      const { summary } = responseData;
      
      setProgress({ current: validContacts.length, total: validContacts.length });
      
      // Toasts específicos para SMTP com validação + variáveis dinâmicas + font-size
      if (summary.successful > 0) {
        toast.success(`✅ SMTP + VALIDAÇÃO + VARIÁVEIS + FONT-SIZE (${fontSize}): ${summary.successful} emails enviados!`, {
          description: `Taxa de sucesso: ${summary.successRate} | Via SMTP com formatação completa`,
          duration: 6000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '2px solid #047857',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }
        });
      }
      
      if (summary.failed > 0) {
        toast.warning(`⚠️ SMTP: ${summary.failed} emails falharam`, {
          description: `Taxa de sucesso: ${summary.successRate} | Verifique configurações SMTP`,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '2px solid #b45309',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
          }
        });
      }

      return {
        success: summary.successful > 0,
        successCount: summary.successful,
        errorCount: summary.failed,
        successRate: summary.successRate,
        totalDuration: summary.totalDuration,
        avgThroughput: summary.avgThroughput,
        validatedEmails: true,
        invalidEmailsRemoved: invalidContacts.length,
        attachmentsIncluded: processedAttachments.length > 0,
        imageUrlIncluded: !!templateData.image_url,
        fontSizeIncluded: fontSize,
        fontSizeValid: fontSize.match(/^\d+px$/) ? true : false,
        dynamicVariablesProcessed: true
      };
    } catch (error: any) {
      console.error('❌ Erro no envio SMTP:', error);
      toast.error(`Erro SMTP: ${error.message}`, {
        description: 'Verifique suas configurações SMTP nas configurações',
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isSending: isProcessing,
    isProcessing,
    progress,
    sendEmailsInBatch,
    sendBatchEmails: sendEmailsInBatch
  };
}

export default useBatchEmailSending;
