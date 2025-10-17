import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Envio {
  id: string;
  user_id: string;
  template_id: string;
  contato_id: string;
  contato_tipo: 'contact' | 'company';
  contato_nome: string;
  contato_email: string;
  assunto: string;
  status: 'enviado' | 'pendente' | 'erro';
  data_envio: string;
  tipo: 'agendamento' | 'envio_imediato';
  created_at: string;
  template?: {
    nome: string;
  };
  contato?: {
    name?: string;
    fantasy_name?: string;
    email: string;
  };
  empresa?: {
    fantasy_name: string;
    email: string;
  };
}

export interface EnvioFormData {
  template_id: string;
  contato_id: string;
  contato_tipo?: 'contact' | 'company';
  assunto?: string;
  conteudo?: string;
  agendamento_id?: string;
}

export function useEnvios() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEnvios = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('envios_historico')
        .select(`
          *,
          template:templates (
            nome
          ),
          contato:contacts (
            name,
            email
          ),
          empresa:companies (
            fantasy_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('data_envio', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar histórico de envios:', fetchError);
        throw fetchError;
      }
      
      setEnvios(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar histórico de envios:', err);
      setError(err.message);
      toast.error('Erro ao carregar histórico de envios');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createEnvio = async (formData: EnvioFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para enviar emails');
      return false;
    }

    try {
      const envioData = {
        ...formData,
        user_id: user.id,
        data_envio: new Date().toISOString(),
        status: 'enviado',
        tipo: 'envio_imediato'
      };

      const { error } = await supabase
        .from('envios_historico')
        .insert([envioData]);

      if (error) throw error;

      fetchEnvios();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar envio:', error);
      toast.error(`Erro ao criar envio: ${error.message}`);
      return false;
    }
  };

  const updateEnvioStatus = async (id: string, status: 'enviado' | 'pendente' | 'erro') => {
    try {
      const { error } = await supabase
        .from('envios_historico')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      fetchEnvios();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar status do envio:', error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
      return false;
    }
  };

  const deleteEnvio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('envios_historico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Envio excluído com sucesso!');
      fetchEnvios();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir envio:', error);
      toast.error(`Erro ao excluir envio: ${error.message}`);
      return false;
    }
  };

  // Filtrar envios por status
  const getEnviosByStatus = (status: string) => {
    return envios.filter(envio => envio.status === status);
  };

  // Filtrar envios por tipo
  const getEnviosByTipo = (tipo: string) => {
    return envios.filter(envio => envio.tipo === tipo);
  };

  // Buscar envios por período
  const getEnviosByPeriod = (startDate: string, endDate: string) => {
    return envios.filter(envio => {
      const envioDate = new Date(envio.data_envio);
      return envioDate >= new Date(startDate) && envioDate <= new Date(endDate);
    });
  };

  useEffect(() => {
    fetchEnvios();
  }, [fetchEnvios]);

  return {
    envios,
    loading,
    error,
    fetchEnvios,
    createEnvio,
    updateEnvioStatus,
    deleteEnvio,
    getEnviosByStatus,
    getEnviosByTipo,
    getEnviosByPeriod
  };
}
