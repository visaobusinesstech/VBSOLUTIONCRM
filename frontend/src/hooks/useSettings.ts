import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface SMTPSettings {
  smtp_host: string;
  smtp_from_name: string;
  email_usuario: string;
  smtp_pass: string;
  email_porta: number;
  smtp_seguranca: 'tls' | 'ssl' | 'none';
  use_smtp: boolean;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  smtp_host?: string;
  smtp_from_name?: string;
  email_usuario?: string;
  smtp_pass?: string;
  email_porta?: number;
  smtp_seguranca?: 'tls' | 'ssl' | 'none';
  use_smtp?: boolean;
  signature_image?: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Tabela não existe ou não tem dados
          setSettings(null);
        } else {
          throw fetchError;
        }
      } else {
        setSettings(data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar configurações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar configurações');
      return false;
    }

    try {
      const settingsData = {
        ...newSettings,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { data, error: upsertError } = await supabase
        .from('configuracoes')
        .upsert(settingsData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      setSettings(data);
      toast.success('Configurações salvas com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      toast.error(`Erro ao salvar configurações: ${err.message}`);
      return false;
    }
  };

  const testSMTP = async (smtpSettings: SMTPSettings) => {
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          smtp_settings: smtpSettings
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao testar SMTP:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    saveSettings,
    testSMTP
  };
}