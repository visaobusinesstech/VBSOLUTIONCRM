import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
  htmlLink: string;
  status: string;
  created: string;
  updated: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
}

// ✅ Função auxiliar para validar e parsear JSON com segurança
async function safeJsonParse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  // Verifica se é realmente JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Resposta não é JSON:', {
      status: response.status,
      contentType,
      url: response.url,
      preview: text.substring(0, 200)
    });
    throw new Error(`Resposta inválida do servidor (Content-Type: ${contentType})`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao parsear JSON:', error);
    const text = await response.text();
    console.error('Conteúdo recebido:', text.substring(0, 200));
    throw new Error('Resposta do servidor não é um JSON válido');
  }
}

export function useGoogleCalendar(ownerId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('primary');
  const { toast } = useToast();

  // ✅ Verificar se está conectado ao Google
  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 Verificando conexão com Google Calendar...');
      
      const response = await fetch(`${API_URL}/api/integrations/google/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        console.warn(`⚠️ API retornou status ${response.status}`);
        setIsConnected(false);
        return false;
      }

      const data = await safeJsonParse(response);
      console.log('✅ Status de conexão:', data);
      
      const connected = data.data?.connected || data.connected || false;
      setIsConnected(connected);
      return connected;
      
    } catch (error) {
      console.error('❌ Erro ao verificar conexão Google:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // ✅ Buscar calendários do Google
  const fetchCalendars = useCallback(async () => {
    if (!isConnected) {
      console.log('⚠️ Google não conectado, pulando busca de calendários');
      return [];
    }

    setLoading(true);
    try {
      console.log('📅 Buscando lista de calendários...');
      
      const response = await fetch(`${API_URL}/api/ai-agent/google-calendar/calendars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Falha ao buscar calendários (status ${response.status})`);
        // Usar calendário padrão como fallback
        const defaultCalendars = [{ 
          id: 'primary', 
          summary: 'Calendário Principal', 
          primary: true, 
          accessRole: 'owner' 
        }];
        setCalendars(defaultCalendars);
        return defaultCalendars;
      }

      const data = await safeJsonParse(response);
      
      if (data.success && data.data) {
        setCalendars(data.data);
        return data.data;
      } else {
        // Fallback para calendário padrão
        const defaultCalendars = [{ 
          id: 'primary', 
          summary: 'Calendário Principal', 
          primary: true, 
          accessRole: 'owner' 
        }];
        setCalendars(defaultCalendars);
        return defaultCalendars;
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar calendários:', error);
      
      // Usar calendário padrão como fallback
      const defaultCalendars = [{ 
        id: 'primary', 
        summary: 'Calendário Principal', 
        primary: true, 
        accessRole: 'owner' 
      }];
      setCalendars(defaultCalendars);
      return defaultCalendars;
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // ✅ Buscar eventos do Google Calendar
  const fetchGoogleEvents = useCallback(async (
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 250
  ): Promise<GoogleCalendarEvent[]> => {
    if (!isConnected) {
      console.log('⚠️ Google não conectado');
      return [];
    }

    setLoading(true);
    try {
      console.log('📅 Buscando eventos do Google Calendar...');
      console.log('📊 Parâmetros:', { timeMin, timeMax, maxResults });
      
      // Construir query string
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      if (maxResults) params.append('maxResults', maxResults.toString());
      if (selectedCalendar) params.append('calendarId', selectedCalendar);
      
      const url = `${API_URL}/api/ai-agent/google-calendar/list-events?${params.toString()}`;
      console.log('🔗 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        console.error(`❌ API retornou status ${response.status}`);
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('📦 Dados recebidos:', data);
      
      if (!data.success) {
        console.log('⚠️ API indicou falha:', data.error);
        throw new Error(data.error || 'Erro ao buscar eventos');
      }
      
      const events = data.data || data.events || [];
      console.log(`✅ ${events.length} eventos recebidos do Google`);
      
      return events;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar eventos do Google:', error);
      
      toast({
        title: 'Erro ao buscar eventos',
        description: error.message || 'Verifique a conexão com o Google Calendar',
        variant: 'destructive',
      });
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedCalendar, toast]);

  // ✅ Criar evento no Google Calendar
  const createGoogleEvent = useCallback(async (eventData: any) => {
    if (!isConnected) {
      toast({
        title: 'Google não conectado',
        description: 'Conecte sua conta Google primeiro',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('➕ Criando evento no Google Calendar...', eventData);
      
      const response = await fetch(`${API_URL}/api/ai-agent/google-calendar/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          calendarId: selectedCalendar
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao criar evento (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Falha ao criar evento');
      }
      
      toast({
        title: 'Sucesso!',
        description: 'Evento sincronizado com Google Calendar',
      });
      
      return data.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar evento no Google:', error);
      
      toast({
        title: 'Erro ao sincronizar',
        description: error.message,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedCalendar, toast]);

  // ✅ Atualizar evento no Google Calendar
  const updateGoogleEvent = useCallback(async (eventId: string, eventData: any) => {
    if (!isConnected) return null;

    setLoading(true);
    try {
      console.log('✏️ Atualizando evento no Google Calendar...', eventId);
      
      const response = await fetch(`${API_URL}/api/ai-agent/google-calendar/update-event/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          calendarId: selectedCalendar
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao atualizar evento (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      return data.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar evento no Google:', error);
      
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedCalendar, toast]);

  // ✅ Deletar evento do Google Calendar
  const deleteGoogleEvent = useCallback(async (eventId: string) => {
    if (!isConnected) return false;

    setLoading(true);
    try {
      console.log('🗑️ Deletando evento do Google Calendar...', eventId);
      
      const response = await fetch(
        `${API_URL}/api/ai-agent/google-calendar/delete-event/${eventId}?calendarId=${selectedCalendar}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Falha ao deletar evento (status ${response.status})`);
      }

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao deletar evento do Google:', error);
      
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [isConnected, selectedCalendar, toast]);

  // ✅ Iniciar conexão com Google
  const connectGoogle = useCallback(async () => {
    try {
      console.log('🔗 Iniciando conexão com Google...');
      
      const response = await fetch(`${API_URL}/api/integrations/google/auth`);

      if (!response.ok) {
        throw new Error(`Erro ao obter URL de autorização (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      
      if (data.success && data.data?.authUrl) {
        // Abrir popup para autorização
        const popup = window.open(
          data.data.authUrl,
          'google-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Monitorar fechamento do popup
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Verificar se a conexão foi bem-sucedida
            setTimeout(() => {
              checkConnection();
            }, 2000);
          }
        }, 1000);
      } else {
        throw new Error('URL de autorização não recebida');
      }
    } catch (error: any) {
      console.error('❌ Erro ao conectar Google:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao iniciar conexão com Google',
        variant: 'destructive',
      });
    }
  }, [checkConnection, toast]);

  // ✅ Desconectar Google
  const disconnectGoogle = useCallback(async () => {
    try {
      console.log('🔌 Desconectando Google Calendar...');
      
      const response = await fetch(`${API_URL}/api/integrations/google/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsConnected(false);
        setCalendars([]);
        
        toast({
          title: 'Desconectado',
          description: 'Google Calendar desconectado com sucesso',
        });
      } else {
        throw new Error(`Falha ao desconectar (status ${response.status})`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao desconectar:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao desconectar Google',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // ✅ Verificar conexão ao montar
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // ✅ Buscar calendários quando conectado
  useEffect(() => {
    if (isConnected) {
      fetchCalendars();
    }
  }, [isConnected, fetchCalendars]);

  return {
    isConnected,
    loading,
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    checkConnection,
    fetchGoogleEvents,
    createGoogleEvent,
    updateGoogleEvent,
    deleteGoogleEvent,
    connectGoogle,
    disconnectGoogle,
  };
}
