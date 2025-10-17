import { useState, useCallback } from 'react';
import { googleCalendarService, CalendarEvent, CalendarActionResult } from '@/services/googleCalendarService';

interface UseGoogleCalendarAIReturn {
  // Estado
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  
  // Ações básicas
  createEvent: (event: CalendarEvent) => Promise<CalendarActionResult>;
  updateEvent: (eventId: string, event: Partial<CalendarEvent>) => Promise<CalendarActionResult>;
  deleteEvent: (eventId: string) => Promise<CalendarActionResult>;
  listEvents: () => Promise<CalendarActionResult>;
  
  // Ações do AI Agent
  executeAIAction: (actionType: string, params: any) => Promise<CalendarActionResult>;
  processAICommand: (command: string, params: any) => Promise<CalendarActionResult>;
  
  // Utilitários
  checkConnection: () => Promise<void>;
  clearError: () => void;
}

export const useGoogleCalendarAI = (): UseGoogleCalendarAIReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar conexão
  const checkConnection = useCallback(async () => {
    try {
      const connected = await googleCalendarService.isConnected();
      setIsConnected(connected);
    } catch (err) {
      console.error('Erro ao verificar conexão:', err);
      setError('Erro ao verificar conexão com Google Calendar');
    }
  }, []);

  // Criar evento
  const createEvent = useCallback(async (event: CalendarEvent): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.createEvent(event);
      
      if (result.success) {
        await checkConnection(); // Atualizar status
      } else {
        setError(result.error || 'Erro ao criar evento');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao criar evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [checkConnection]);

  // Atualizar evento
  const updateEvent = useCallback(async (eventId: string, event: Partial<CalendarEvent>): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.updateEvent(eventId, event);
      
      if (result.success) {
        await checkConnection(); // Atualizar status
      } else {
        setError(result.error || 'Erro ao atualizar evento');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao atualizar evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [checkConnection]);

  // Deletar evento
  const deleteEvent = useCallback(async (eventId: string): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.deleteEvent(eventId);
      
      if (result.success) {
        await checkConnection(); // Atualizar status
      } else {
        setError(result.error || 'Erro ao deletar evento');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao deletar evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [checkConnection]);

  // Listar eventos
  const listEvents = useCallback(async (): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.listEvents();
      
      if (!result.success) {
        setError(result.error || 'Erro ao listar eventos');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao listar eventos';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Executar ação do AI Agent
  const executeAIAction = useCallback(async (actionType: string, params: any = {}): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.executeAIAgentAction(actionType as any, params);
      
      if (!result.success) {
        setError(result.error || 'Erro ao executar ação do AI Agent');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao executar ação do AI Agent';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Processar comando do AI Agent
  const processAICommand = useCallback(async (command: string, params: any = {}): Promise<CalendarActionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await googleCalendarService.processAICommand(command, params);
      
      if (!result.success) {
        setError(result.error || 'Erro ao processar comando do AI Agent');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Erro ao processar comando do AI Agent';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isConnected,
    loading,
    error,
    
    // Ações básicas
    createEvent,
    updateEvent,
    deleteEvent,
    listEvents,
    
    // Ações do AI Agent
    executeAIAction,
    processAICommand,
    
    // Utilitários
    checkConnection,
    clearError
  };
};
