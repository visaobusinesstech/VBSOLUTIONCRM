import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Mail
} from 'lucide-react';

interface ScheduledEmail {
  id: string;
  data_envio: string;
  status: string;
  contato: {
    id: string;
    nome: string;
    email: string;
  };
  template: {
    id: string;
    nome: string;
  };
}

export function ScheduledEmailsMonitor() {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const fetchScheduledEmails = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_envio,
          status,
          contato:contatos (
            id,
            nome,
            email
          ),
          template:templates (
            id,
            nome,
            conteudo,
            attachments,
            signature_image
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .lte('data_envio', new Date().toISOString())
        .order('data_envio', { ascending: true });

      if (error) throw error;
      setScheduledEmails(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar emails agendados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar emails agendados: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendScheduledEmail = async (scheduledEmail: ScheduledEmail) => {
    if (!user) return;

    setSending(true);
    try {
      console.log('📧 Enviando email agendado:', scheduledEmail);

      // Buscar configurações SMTP do usuário
      const { data: userSettings, error: settingsError } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError || !userSettings?.use_smtp || !userSettings?.smtp_host) {
        throw new Error('SMTP deve estar configurado e ativado para envio de emails agendados.');
      }

      // Buscar dados completos do template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', scheduledEmail.template?.id)
        .single();

      if (templateError) {
        console.error('Erro ao buscar template:', templateError);
        throw new Error(`Erro ao carregar template: ${templateError.message}`);
      }

      // Buscar dados completos do contato
      const { data: contactData, error: contactError } = await supabase
        .from('contatos')
        .select('*')
        .eq('id', scheduledEmail.contato?.id)
        .single();

      if (contactError) {
        console.error('Erro ao buscar contato:', contactError);
        throw new Error(`Erro ao carregar contato: ${contactError.message}`);
      }

      // CORREÇÃO: Configurações SMTP completas
      const smtpSettings = {
        host: userSettings.smtp_host,
        port: userSettings.email_porta || 587,
        secure: userSettings.smtp_seguranca === 'ssl',
        password: userSettings.smtp_pass,
        from_name: userSettings.smtp_from_name || 'Sistema',
        from_email: userSettings.email_usuario || '',
        username: userSettings.email_usuario || ''
      };

      // CORREÇÃO: Dados completos do email incluindo assinatura e anexos
      const emailData = {
        to: scheduledEmail.contato.email,
        subject: templateData?.descricao || templateData?.nome || 'Email Agendado',
        content: templateData?.conteudo || '',
        contato_id: contactData?.id,
        template_id: templateData?.id,
        user_id: user.id,
        contato_nome: scheduledEmail.contato.nome,
        contact: contactData,
        attachments: templateData?.attachments || null,
        signature_image: userSettings?.signature_image || templateData?.signature_image || null
      };

      console.log('📧 Dados do email preparados:', {
        to: emailData.to,
        subject: emailData.subject,
        has_content: !!emailData.content,
        has_attachments: !!emailData.attachments,
        has_signature: !!emailData.signature_image,
        user_id: emailData.user_id
      });

      // Chamar a edge function para envio
      const response = await supabase.functions.invoke('send-email', {
        body: {
          ...emailData,
          smtp_settings: smtpSettings,
          use_smtp: true
        }
      });

      if (response.error) {
        console.error("❌ Erro na função de envio:", response.error);
        throw new Error(`Erro no envio: ${response.error.message || response.error}`);
      }

      const responseData = response.data;
      if (!responseData || !responseData.success) {
        console.error("❌ Resposta de falha:", responseData);
        throw new Error(responseData?.error || "Falha no envio do email agendado");
      }

      // Atualizar status do agendamento
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({ status: 'enviado' })
        .eq('id', scheduledEmail.id);

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
      }

      toast({
        title: "Sucesso",
        description: `Email enviado para ${scheduledEmail.contato.email} com sucesso!`
      });

      // Recarregar lista
      await fetchScheduledEmails();

    } catch (error: any) {
      console.error('❌ Erro ao enviar email agendado:', error);
      
      // Atualizar status para erro
      try {
        await supabase
          .from('agendamentos')
          .update({ 
            status: 'erro',
            mensagem_erro: error.message 
          })
          .eq('id', scheduledEmail.id);
      } catch (updateError) {
        console.error('Erro ao atualizar status de erro:', updateError);
      }

      toast({
        title: "Erro",
        description: `Erro ao enviar email: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchScheduledEmails();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchScheduledEmails, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'enviado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erro':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'secondary' as const,
      enviado: 'default' as const,
      erro: 'destructive' as const
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Monitor de Emails Agendados
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchScheduledEmails}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Carregando emails agendados...</p>
          </div>
        ) : scheduledEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum email agendado para envio no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(email.status)}
                    <span className="font-medium">{email.contato.nome}</span>
                    <Badge variant={getStatusBadge(email.status)}>
                      {email.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {email.contato.email} • {email.template.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Agendado para: {new Date(email.data_envio).toLocaleString('pt-BR')}
                  </p>
                </div>

                {email.status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => sendScheduledEmail(email)}
                    disabled={sending}
                    className="ml-4"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Enviando...' : 'Enviar Agora'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
