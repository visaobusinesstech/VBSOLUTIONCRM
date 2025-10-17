import { useState, useCallback } from 'react';
import { aiAgentGoogleCalendarService, AIAgentAction, AIAgentResponse } from '@/services/aiAgentGoogleCalendarService';
import { useToast } from '@/components/ui/use-toast';

interface UseAIAgentGoogleCalendarReturn {
  // Estado
  loading: boolean;
  error: string | null;
  
  // Ações do AI Agent
  executeAction: (action: AIAgentAction) => Promise<AIAgentResponse>;
  processCommand: (command: string, context?: any) => Promise<AIAgentResponse>;
  
  // Utilitários
  clearError: () => void;
}

export const useAIAgentGoogleCalendar = (): UseAIAgentGoogleCalendarReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Executar ação do AI Agent
  const executeAction = useCallback(async (action: AIAgentAction): Promise<AIAgentResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiAgentGoogleCalendarService.processAction(action);
      
      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message,
        });
      } else {
        setError(result.error || 'Erro ao executar ação');
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao executar ação',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = 'Erro ao executar ação do AI Agent';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Processar comando em linguagem natural
  const processCommand = useCallback(async (command: string, context?: any): Promise<AIAgentResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiAgentGoogleCalendarService.processNaturalLanguageCommand(command, context);
      
      if (result.success) {
        toast({
          title: 'Comando executado!',
          description: result.message,
        });
      } else {
        setError(result.error || 'Erro ao processar comando');
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao processar comando',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = 'Erro ao processar comando do AI Agent';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    
    // Ações do AI Agent
    executeAction,
    processCommand,
    
    // Utilitários
    clearError
  };
};
