import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useGoogleCalendar } from './useGoogleCalendar';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  type: 'meeting' | 'call' | 'demo' | 'proposal' | 'follow_up' | 'deadline' | 'other';
  location?: string;
  attendees?: string[];
  is_all_day: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  google_event_id?: string;
  created_at: string;
  updated_at: string;
  isGoogleEvent?: boolean;
  googleEventLink?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start: string | Date;
  end?: string | Date;
  type: 'meeting' | 'call' | 'demo' | 'proposal' | 'follow_up' | 'deadline' | 'other';
  location?: string;
  attendees?: string[];
  is_all_day?: boolean;
  sync_to_google?: boolean;
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

export function useCalendar() {
  const { user } = useUser();
  const { integrations, isPlatformConnected } = useIntegrations();
  const googleCalendar = useGoogleCalendar(user?.id || '');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // ✅ Buscar eventos locais
  const fetchLocalEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!user?.id) {
      console.log('❌ Usuário não identificado');
      return [];
    }

    try {
      console.log('🔍 Buscando eventos locais...');
      
      const response = await fetch('/api/calendar/events', {
        headers: {
          'x-user-id': user.id,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer VB_DEV_TOKEN',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Erro ao buscar eventos locais (status ${response.status})`);
        return [];
      }

      const data = await safeJsonParse(response);
      
      if (data.success) {
        const localEvents = data.data || [];
        console.log(`✅ ${localEvents.length} eventos locais encontrados`);
        return localEvents;
      } else {
        console.warn('⚠️ API indicou falha ao buscar eventos locais');
        return [];
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar eventos locais:', error);
      return [];
    }
  }, [user?.id]);

  // ✅ Buscar eventos do Google Calendar
  const fetchGoogleEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!googleCalendar.isConnected) {
      console.log('❌ Google não conectado, pulando eventos do Google');
      return [];
    }

    try {
      console.log('🔍 Buscando eventos do Google Calendar...');
      
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      
      const rawGoogleEvents = await googleCalendar.fetchGoogleEvents(
        threeMonthsAgo.toISOString(),
        threeMonthsFromNow.toISOString()
      );
      
      console.log(`📦 ${rawGoogleEvents.length} eventos do Google recebidos`);
      
      // Converter eventos do Google para formato local
      const googleEvents = rawGoogleEvents.map((event: any) => {
        console.log('🔄 Convertendo evento:', event.summary || event.title);
        
        return {
          id: `google-${event.id}`,
          title: event.summary || event.title || 'Evento sem título',
          description: event.description || '',
          start: new Date(event.start.dateTime || event.start.date),
          end: event.end ? new Date(event.end.dateTime || event.end.date) : undefined,
          type: 'other' as const,
          location: event.location || '',
          attendees: event.attendees?.map((a: any) => a.email || a) || [],
          is_all_day: !event.start.dateTime,
          status: event.status === 'confirmed' ? 'scheduled' : 'cancelled',
          google_event_id: event.id,
          created_at: event.created,
          updated_at: event.updated,
          isGoogleEvent: true,
          googleEventLink: event.htmlLink,
        };
      });
      
      console.log(`✅ ${googleEvents.length} eventos do Google convertidos`);
      return googleEvents;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar eventos do Google:', error);
      return [];
    }
  }, [googleCalendar]);

  // ✅ Função para mesclar eventos locais com eventos do Google
  const getAllEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user?.id) {
      console.log('❌ Usuário não identificado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📅 Iniciando busca de eventos...');
      
      // 1. Buscar eventos locais
      const localEvents = await fetchLocalEvents();
      
      // 2. Buscar eventos do Google se conectado
      const googleEvents = await fetchGoogleEvents();
      
      // 3. Mesclar eventos (evitar duplicatas)
      const localEventIds = new Set(
        localEvents
          .filter(e => e.google_event_id)
          .map(e => e.google_event_id)
      );
      
      const uniqueGoogleEvents = googleEvents.filter(
        e => !localEventIds.has(e.google_event_id)
      );
      
      const allEvents = [...localEvents, ...uniqueGoogleEvents];
      console.log(`🎉 Total de eventos: ${allEvents.length} (${localEvents.length} locais + ${uniqueGoogleEvents.length} do Google)`);
      
      setEvents(allEvents);
      return allEvents;
    } catch (error: any) {
      console.error('❌ Erro ao buscar eventos:', error);
      setError(error.message || 'Erro ao buscar eventos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchLocalEvents, fetchGoogleEvents]);

  // ✅ Criar evento local
  const createLocalEvent = useCallback(async (eventData: CreateEventData): Promise<CalendarEvent | null> => {
    if (!user?.id) {
      console.log('❌ Usuário não identificado');
      return null;
    }

    try {
      console.log('➕ Criando evento local...', eventData);
      
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer VB_DEV_TOKEN',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar evento (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar evento');
      }

      console.log('✅ Evento local criado:', data.data);
      return data.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar evento local:', error);
      throw error;
    }
  }, [user?.id]);

  // ✅ Criar evento com sincronização Google
  const createEventWithSync = useCallback(async (eventData: CreateEventData): Promise<CalendarEvent | null> => {
    if (!user?.id) return null;

    try {
      console.log('📅 Criando evento com sincronização...');
      
      // 1. Criar evento local primeiro
      const localEvent = await createLocalEvent(eventData);
      
      if (!localEvent) {
        throw new Error('Falha ao criar evento local');
      }

      // 2. Se deve sincronizar com Google e está conectado
      if (eventData.sync_to_google && googleCalendar.isConnected) {
        console.log('🔄 Sincronizando com Google Calendar...');
        
        const googleEventData = {
          summary: eventData.title,
          description: eventData.description || '',
          start: eventData.is_all_day 
            ? { date: new Date(eventData.start).toISOString().split('T')[0] }
            : { dateTime: new Date(eventData.start).toISOString() },
          end: eventData.end 
            ? (eventData.is_all_day 
                ? { date: new Date(eventData.end).toISOString().split('T')[0] }
                : { dateTime: new Date(eventData.end).toISOString() })
            : undefined,
          location: eventData.location || '',
          attendees: eventData.attendees?.map(email => ({ email })) || [],
        };
        
        const googleEvent = await googleCalendar.createGoogleEvent(googleEventData);
        
        if (googleEvent) {
          console.log('✅ Evento sincronizado com Google:', googleEvent);
          // Aqui você poderia atualizar o evento local com o google_event_id
          // await updateEvent(localEvent.id, { google_event_id: googleEvent.id });
        }
      }
      
      // 3. Recarregar eventos
      await getAllEvents();
      
      return localEvent;
    } catch (error: any) {
      console.error('❌ Erro ao criar evento:', error);
      setError(error.message || 'Erro ao criar evento');
      return null;
    }
  }, [user?.id, createLocalEvent, googleCalendar, getAllEvents]);

  // ✅ Atualizar evento
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!user?.id) return null;

    setLoading(true);
    try {
      console.log('✏️ Atualizando evento:', eventId);
      
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.id,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer VB_DEV_TOKEN',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar evento (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao atualizar evento');
      }

      console.log('✅ Evento atualizado:', data.data);
      
      // Recarregar eventos
      await getAllEvents();
      
      return data.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar evento:', error);
      setError(error.message || 'Erro ao atualizar evento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, getAllEvents]);

  // ✅ Deletar evento
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      console.log('🗑️ Deletando evento:', eventId);
      
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer VB_DEV_TOKEN',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar evento (status ${response.status})`);
      }

      const data = await safeJsonParse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao deletar evento');
      }

      console.log('✅ Evento deletado');
      
      // Recarregar eventos
      await getAllEvents();
      
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao deletar evento:', error);
      setError(error.message || 'Erro ao deletar evento');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, getAllEvents]);

  // ✅ Buscar eventos para uma data específica
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.start).toDateString();
      return eventDate === dateStr;
    });
  }, [events]);

  // ✅ Buscar eventos para um intervalo de datas
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      
      return (eventStart >= startDate && eventStart <= endDate) ||
             (eventEnd >= startDate && eventEnd <= endDate) ||
             (eventStart <= startDate && eventEnd >= endDate);
    });
  }, [events]);

  // ✅ Navegar entre datas
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      
      switch (viewMode) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
      }
      
      return newDate;
    });
  }, [viewMode]);

  // ✅ Ir para hoje
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // ✅ Carregar eventos quando o usuário ou conexão Google mudar
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Usuário identificado, carregando eventos...');
      getAllEvents();
    }
  }, [user?.id, googleCalendar.isConnected, getAllEvents]);

  return {
    // Estado
    events,
    loading,
    error,
    currentDate,
    viewMode,
    
    // Ações
    setViewMode,
    setCurrentDate,
    createEvent: createEventWithSync,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForDateRange,
    navigateDate,
    goToToday,
    refreshEvents: getAllEvents,
    
    // Google Calendar
    isGoogleConnected: googleCalendar.isConnected,
    connectGoogle: googleCalendar.connectGoogle,
    disconnectGoogle: googleCalendar.disconnectGoogle,
    googleCalendars: googleCalendar.calendars,
    selectedGoogleCalendar: googleCalendar.selectedCalendar,
    setSelectedGoogleCalendar: googleCalendar.setSelectedCalendar,
  };
}
