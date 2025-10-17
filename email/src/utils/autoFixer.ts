
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutoFixResult {
  success: boolean;
  message: string;
  details?: string;
}

export class AutoFixer {
  static async fixSmtpConfiguration(userId: string): Promise<AutoFixResult> {
    try {
      // Verificar se já existe configuração SMTP
      const { data: existing, error: fetchError } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Configuração básica padrão do SMTP
      const defaultConfig = {
        user_id: userId,
        use_smtp: true,
        smtp_host: 'smtp.gmail.com',
        email_porta: 587,
        smtp_seguranca: 'tls',
        smtp_from_name: 'RocketMail',
        ...(existing || {})
      };

      const { error } = await supabase
        .from('configuracoes')
        .upsert(defaultConfig);

      if (error) throw error;

      return {
        success: true,
        message: 'Configurações SMTP corrigidas automaticamente',
        details: 'Configuração padrão aplicada. Configure suas credenciais específicas.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao corrigir configurações SMTP',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async fixDatabaseConnection(): Promise<AutoFixResult> {
    try {
      // Tentar reconectar forçando refresh da sessão
      const { error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      // Testar conexão com uma query simples
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (testError) throw testError;

      return {
        success: true,
        message: 'Conexão com banco de dados reestabelecida',
        details: 'Sessão atualizada e conectividade verificada'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao reestabelecer conexão com banco',
        details: error instanceof Error ? error.message : 'Erro de conectividade'
      };
    }
  }

  static async fixAuthenticationIssues(): Promise<AutoFixResult> {
    try {
      // Verificar se o token é válido
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session.session) {
        return {
          success: false,
          message: 'Usuário não autenticado',
          details: 'Faça login novamente para resolver problemas de autenticação'
        };
      }

      // Verificar se o usuário existe no perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Criar perfil se não existir
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.session.user.id,
            nome: session.session.user.email?.split('@')[0] || 'Usuário'
          });

        if (insertError) throw insertError;

        return {
          success: true,
          message: 'Perfil de usuário criado automaticamente',
          details: 'Problema de autenticação resolvido'
        };
      }

      return {
        success: true,
        message: 'Autenticação funcionando normalmente',
        details: 'Nenhuma correção necessária'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao corrigir problemas de autenticação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async fixEmailService(): Promise<AutoFixResult> {
    try {
      // Testar se a edge function está respondendo
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          test: true, 
          validate_only: true 
        }
      });

      if (error && !error.message.includes('test') && !error.message.includes('validation')) {
        throw error;
      }

      return {
        success: true,
        message: 'Serviço de email funcionando',
        details: 'Edge function respondendo normalmente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Serviço de email indisponível',
        details: 'Edge function pode estar offline ou com problemas'
      };
    }
  }

  static async fixScheduledEmailProcessor(): Promise<AutoFixResult> {
    try {
      // Verificar agendamentos em atraso
      const { data: overdueSchedules, error } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('status', 'pendente')
        .lt('data_envio', new Date(Date.now() - 300000).toISOString()); // 5 minutos atrás

      if (error) throw error;

      if (overdueSchedules && overdueSchedules.length > 0) {
        // Tentar processar manualmente alguns agendamentos
        const { error: processError } = await supabase.functions.invoke('process-scheduled-emails');
        
        if (processError) {
          return {
            success: false,
            message: 'Processador de emails com problemas',
            details: `${overdueSchedules.length} agendamentos em atraso`
          };
        }

        return {
          success: true,
          message: 'Processamento de emails reativado',
          details: `Processando ${overdueSchedules.length} agendamentos em atraso`
        };
      }

      return {
        success: true,
        message: 'Processamento de emails em dia',
        details: 'Nenhum agendamento em atraso detectado'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar processamento de emails',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async runAllFixes(userId: string): Promise<{
    results: Record<string, AutoFixResult>;
    summary: {
      total: number;
      fixed: number;
      failed: number;
    };
  }> {
    const fixes = [
      { name: 'smtp', fn: () => this.fixSmtpConfiguration(userId) },
      { name: 'database', fn: () => this.fixDatabaseConnection() },
      { name: 'auth', fn: () => this.fixAuthenticationIssues() },
      { name: 'email', fn: () => this.fixEmailService() },
      { name: 'scheduler', fn: () => this.fixScheduledEmailProcessor() }
    ];

    const results: Record<string, AutoFixResult> = {};
    let fixed = 0;
    let failed = 0;

    for (const fix of fixes) {
      try {
        const result = await fix.fn();
        results[fix.name] = result;
        
        if (result.success) {
          fixed++;
        } else {
          failed++;
        }
      } catch (error) {
        results[fix.name] = {
          success: false,
          message: 'Erro durante correção automática',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        };
        failed++;
      }
    }

    return {
      results,
      summary: {
        total: fixes.length,
        fixed,
        failed
      }
    };
  }
}

export const autoFixer = AutoFixer;
