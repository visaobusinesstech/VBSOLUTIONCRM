import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type Schedule = {
  id: string;
  contato_id: string;
  template_id: string;
  data_envio: string;
  status: string;
  created_at: string;
  contato_tipo?: 'contact' | 'company';
  user_id?: string;
};

export type ScheduleFormData = {
  contato_id: string;
  template_id: string;
  data_envio: string;
  contato_tipo?: 'contact' | 'company';
};

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSchedules = useCallback(async () => {
    try {
      if (!user) {
        setError("Você precisa estar logado para ver os agendamentos");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('data_envio', { ascending: true });

      if (fetchError) {
        console.error("Error fetching schedules:", fetchError);
        throw fetchError;
      }
      
      console.log("Schedules fetched:", data);
      setSchedules(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar agendamentos';
      console.error("Error in fetchSchedules:", errorMessage);
      setError(errorMessage);
      toast.error('Erro ao carregar agendamentos: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSchedule = async (formData: ScheduleFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar agendamentos');
      return false;
    }

    try {
      const scheduleData = {
        user_id: user.id,
        template_id: formData.template_id,
        contato_id: formData.contato_id,
        data_envio: formData.data_envio,
        status: 'pendente',
        contato_tipo: formData.contato_tipo || 'contact'
      };

      console.log('Creating schedule with data:', scheduleData);

      const { error } = await supabase
        .from('agendamentos')
        .insert([scheduleData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Agendamento criado com sucesso!');
      fetchSchedules();
      return true;
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast.error(`Erro ao criar agendamento: ${error.message}`);
      return false;
    }
  };

  const updateSchedule = async (id: string, formData: Partial<ScheduleFormData>) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Agendamento atualizado com sucesso!');
      fetchSchedules();
      return true;
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
      return false;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Agendamento excluído com sucesso!');
      fetchSchedules();
      return true;
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error(`Erro ao excluir agendamento: ${error.message}`);
      return false;
    }
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
}
