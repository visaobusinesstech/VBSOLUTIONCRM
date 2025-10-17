import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface BatchEmailResult {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  errors: string[];
  duration: number;
}

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  isProcessing: boolean;
}

export function useBatchEmailSending() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    current: 0,
    total: 0,
    percentage: 0,
    isProcessing: false
  });
  const { user } = useAuth();

  const sendBatchEmails = useCallback(async (
    selectedContacts: any[],
    templateId: string,
    customSubject?: string,
    customContent?: string,
    useParallelProcessing = true
  ): Promise<BatchEmailResult | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para enviar emails');
      return null;
    }

    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um destinatário');
      return null;
    }

    setIsProcessing(true);
    setProgress({
      current: 0,
      total: selectedContacts.length,
      percentage: 0,
      isProcessing: true
    });

    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      // Buscar template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();

      if (templateError || !templateData) {
        throw new Error('Template não encontrado');
      }

      // Buscar configurações SMTP
      const { data: userSettings, error: settingsError } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError || !userSettings?.smtp_host) {
        throw new Error('SMTP não configurado. Configure nas configurações do sistema.');
      }

      // Preparar dados dos emails
      const emailJobs = selectedContacts.map((contact, index) => ({
        to: contact.email,
        contato_id: contact.id,
        template_id: templateId,
        contato_nome: contact.name || contact.fantasy_name,
        subject: customSubject || templateData.nome,
        content: customContent || templateData.conteudo,
        template_nome: templateData.nome,
        contact: {
          ...contact,
          user_id: user.id,
          nome: contact.name || contact.fantasy_name,
          email: contact.email
        },
        user_id: user.id,
        image_url: templateData.image_url,
        signature_image: userSettings?.signature_image || templateData.signature_image,
        attachments: templateData.attachments || [],
        index: index
      }));

      // Configurações SMTP
      const smtpSettings = {
        host: userSettings.smtp_host,
        port: userSettings.email_porta || 587,
        secure: userSettings.smtp_seguranca === 'ssl',
        password: userSettings.smtp_pass,
        from_name: userSettings.smtp_from_name || 'Sistema Email',
        from_email: userSettings.email_usuario || ''
      };

      console.log("📧 Enviando lote de emails:", {
        batch_size: emailJobs.length,
        use_parallel: useParallelProcessing,
        smtp_configured: !!smtpSettings.host
      });

      // Enviar via Edge Function test-send-email
      const response = await supabase.functions.invoke('test-send-email', {
        body: {
          batch: true,
          emails: emailJobs,
          smtp_settings: smtpSettings,
          use_smtp: true,
          reliability_mode: true,
          validated_emails: true,
          dynamic_variables_backend: true,
          font_size_support: true,
          global_font_size: '14px',
          tipo_envio: 'envio_imediato',
          parallel_processing: useParallelProcessing,
          batch_optimization: true
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar emails');
      }

      const result = response.data;
      const duration = Date.now() - startTime;

      if (result && result.success) {
        successCount = result.summary?.successful || result.success_count || emailJobs.length;
        failedCount = result.summary?.failed || 0;

        // Salvar no histórico
        const historicoData = emailJobs.slice(0, successCount).map(recipient => ({
          user_id: user.id,
          template_id: templateId,
          contato_id: recipient.contato_id,
          contato_tipo: recipient.contact.tipo || 'contact',
          contato_nome: recipient.contato_nome,
          contato_email: recipient.to,
          assunto: recipient.subject,
          status: 'enviado',
          data_envio: new Date().toISOString(),
          tipo: 'envio_imediato'
        }));

        if (historicoData.length > 0) {
          await supabase
            .from('envios_historico')
            .insert(historicoData);
        }

        setProgress({
          current: emailJobs.length,
          total: emailJobs.length,
          percentage: 100,
          isProcessing: false
        });

        return {
          success: true,
          totalSent: successCount,
          totalFailed: failedCount,
          errors: [],
          duration
        };
      } else {
        throw new Error(result?.error || 'Falha no envio');
      }

    } catch (error: any) {
      console.error('Erro ao enviar lote de emails:', error);
      errors.push(error.message);
      
      setProgress({
        current: 0,
        total: selectedContacts.length,
        percentage: 0,
        isProcessing: false
      });

      return {
        success: false,
        totalSent: successCount,
        totalFailed: failedCount + selectedContacts.length,
        errors,
        duration: Date.now() - startTime
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const updateProgress = useCallback((current: number, total: number) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    setProgress({
      current,
      total,
      percentage,
      isProcessing: true
    });
  }, []);

  return {
    isProcessing,
    progress,
    sendBatchEmails,
    updateProgress
  };
}
