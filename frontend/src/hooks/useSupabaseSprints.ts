import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Sprint {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim?: string | null;
  status: 'em_andamento' | 'finalizada';
  company_id?: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  responsible_id?: string;
  company_id?: string;
  sprint_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseSprints = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Função para carregar sprints
  const loadSprints = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('sprints')
        .select(`
          id,
          nome,
          data_inicio,
          data_fim,
          status,
          company_id,
          owner_id,
          created_at,
          updated_at
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSprints(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar sprints:', err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar sprints',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar uma nova sprint
  const createSprint = async (nome: string, companyId?: string) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return null;
    }

    // Verificar se já existe uma sprint em andamento
    const sprintEmAndamento = sprints.find(s => s.status === 'em_andamento');
    if (sprintEmAndamento) {
      toast({
        title: 'Sprint em andamento',
        description: `Já existe uma sprint em andamento: "${sprintEmAndamento.nome}". Finalize-a antes de iniciar uma nova.`,
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('sprints')
        .insert({
          nome,
          data_inicio: new Date().toISOString(),
          status: 'em_andamento',
          company_id: companyId || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Sprint criada',
        description: `Sprint "${nome}" foi iniciada com sucesso!`,
      });

      // Recarregar sprints
      await loadSprints();
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar sprint:', err);
      toast({
        title: 'Erro ao criar sprint',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Função para iniciar uma sprint existente (mudar status de planejada para em_andamento)
  const iniciarSprint = async (sprintId: string) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se já existe uma sprint em andamento
    const sprintEmAndamento = sprints.find(s => s.status === 'em_andamento');
    if (sprintEmAndamento && sprintEmAndamento.id !== sprintId) {
      toast({
        title: 'Sprint em andamento',
        description: `Já existe uma sprint em andamento: "${sprintEmAndamento.nome}". Finalize-a antes de iniciar uma nova.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('sprints')
        .update({
          status: 'em_andamento',
          data_inicio: new Date().toISOString(),
        })
        .eq('id', sprintId);

      if (updateError) throw updateError;

      toast({
        title: 'Sprint iniciada',
        description: 'Sprint foi iniciada com sucesso!',
      });

      // Recarregar sprints
      await loadSprints();
    } catch (err: any) {
      console.error('Erro ao iniciar sprint:', err);
      toast({
        title: 'Erro ao iniciar sprint',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Função para finalizar uma sprint
  const finalizarSprint = async (sprintId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('sprints')
        .update({
          status: 'finalizada',
          data_fim: new Date().toISOString(),
        })
        .eq('id', sprintId);

      if (updateError) throw updateError;

      toast({
        title: 'Sprint finalizada',
        description: 'Sprint foi finalizada com sucesso!',
      });

      // Recarregar sprints
      await loadSprints();
    } catch (err: any) {
      console.error('Erro ao finalizar sprint:', err);
      toast({
        title: 'Erro ao finalizar sprint',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Função para vincular atividade a uma sprint
  const vincularAtividade = async (atividadeId: string, sprintId: string | null) => {
    try {
      const { error: updateError } = await supabase
        .from('activities')
        .update({ sprint_id: sprintId })
        .eq('id', atividadeId);

      if (updateError) throw updateError;

      toast({
        title: sprintId ? 'Atividade vinculada' : 'Atividade desvinculada',
        description: sprintId 
          ? 'Atividade vinculada à sprint com sucesso!' 
          : 'Atividade desvinculada da sprint.',
      });
    } catch (err: any) {
      console.error('Erro ao vincular atividade:', err);
      toast({
        title: 'Erro ao vincular atividade',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Função para buscar atividades de uma sprint
  const getAtividadesDaSprint = async (sprintId: string): Promise<Activity[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar atividades da sprint:', err);
      toast({
        title: 'Erro ao buscar atividades',
        description: err.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  // Função para deletar uma sprint
  const deletarSprint = async (sprintId: string) => {
    try {
      // Primeiro, desvincular todas as atividades da sprint
      const { error: updateError } = await supabase
        .from('activities')
        .update({ sprint_id: null })
        .eq('sprint_id', sprintId);

      if (updateError) throw updateError;

      // Depois, deletar a sprint
      const { error: deleteError } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprintId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Sprint excluída',
        description: 'Sprint foi excluída com sucesso!',
      });

      // Recarregar sprints
      await loadSprints();
    } catch (err: any) {
      console.error('Erro ao deletar sprint:', err);
      toast({
        title: 'Erro ao deletar sprint',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Função para atualizar nome da sprint
  const atualizarNomeSprint = async (sprintId: string, novoNome: string) => {
    try {
      const { error: updateError } = await supabase
        .from('sprints')
        .update({ nome: novoNome })
        .eq('id', sprintId);

      if (updateError) throw updateError;

      toast({
        title: 'Sprint atualizada',
        description: 'Nome da sprint atualizado com sucesso!',
      });

      // Recarregar sprints
      await loadSprints();
    } catch (err: any) {
      console.error('Erro ao atualizar sprint:', err);
      toast({
        title: 'Erro ao atualizar sprint',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Carregar sprints na montagem do componente
  useEffect(() => {
    loadSprints();
  }, [user?.id]);

  // Configurar realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('sprints_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sprints',
          filter: `owner_id=eq.${user.id}`,
        },
        () => {
          loadSprints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    sprints,
    loading,
    error,
    createSprint,
    iniciarSprint,
    finalizarSprint,
    vincularAtividade,
    getAtividadesDaSprint,
    deletarSprint,
    atualizarNomeSprint,
    recarregar: loadSprints,
  };
};

