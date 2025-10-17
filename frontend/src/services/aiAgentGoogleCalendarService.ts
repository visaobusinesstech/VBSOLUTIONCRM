import { googleCalendarService, CalendarEvent } from './googleCalendarService';

export interface AIAgentAction {
  action: 'create' | 'update' | 'delete' | 'list';
  params: any;
}

export interface AIAgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class AIAgentGoogleCalendarService {
  /**
   * Processar ação do AI Agent
   */
  async processAction(action: AIAgentAction): Promise<AIAgentResponse> {
    try {
      switch (action.action) {
        case 'create':
          return await this.handleCreate(action.params);
        
        case 'update':
          return await this.handleUpdate(action.params);
        
        case 'delete':
          return await this.handleDelete(action.params);
        
        case 'list':
          return await this.handleList(action.params);
        
        default:
          return {
            success: false,
            message: 'Ação não reconhecida',
            error: `Ação "${action.action}" não é válida`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao processar ação do AI Agent',
        error: error.message
      };
    }
  }

  /**
   * Criar evento via AI Agent
   */
  private async handleCreate(params: CalendarEvent): Promise<AIAgentResponse> {
    const result = await googleCalendarService.createEvent(params);
    
    return {
      success: result.success,
      message: result.success 
        ? `Evento "${params.title}" criado com sucesso!` 
        : 'Falha ao criar evento',
      data: result.data,
      error: result.error
    };
  }

  /**
   * Atualizar evento via AI Agent
   */
  private async handleUpdate(params: { eventId: string; updates: Partial<CalendarEvent> }): Promise<AIAgentResponse> {
    const result = await googleCalendarService.updateEvent(params.eventId, params.updates);
    
    return {
      success: result.success,
      message: result.success 
        ? 'Evento atualizado com sucesso!' 
        : 'Falha ao atualizar evento',
      data: result.data,
      error: result.error
    };
  }

  /**
   * Deletar evento via AI Agent
   */
  private async handleDelete(params: { eventId: string }): Promise<AIAgentResponse> {
    const result = await googleCalendarService.deleteEvent(params.eventId);
    
    return {
      success: result.success,
      message: result.success 
        ? 'Evento removido com sucesso!' 
        : 'Falha ao remover evento',
      error: result.error
    };
  }

  /**
   * Listar eventos via AI Agent
   */
  private async handleList(params?: { timeMin?: string; timeMax?: string }): Promise<AIAgentResponse> {
    const result = await googleCalendarService.listEvents();
    
    return {
      success: result.success,
      message: result.success 
        ? `${result.data?.events?.length || 0} eventos encontrados` 
        : 'Falha ao listar eventos',
      data: result.data,
      error: result.error
    };
  }

  /**
   * Processar comando em linguagem natural
   */
  async processNaturalLanguageCommand(command: string, context?: any): Promise<AIAgentResponse> {
    // Normalizar comando
    const normalizedCommand = command.toLowerCase().trim();
    
    // Detectar intenção
    if (this.isCreateIntent(normalizedCommand)) {
      return await this.extractAndCreate(command, context);
    }
    
    if (this.isUpdateIntent(normalizedCommand)) {
      return await this.extractAndUpdate(command, context);
    }
    
    if (this.isDeleteIntent(normalizedCommand)) {
      return await this.extractAndDelete(command, context);
    }
    
    if (this.isListIntent(normalizedCommand)) {
      return await this.handleList(context);
    }
    
    return {
      success: false,
      message: 'Não consegui entender o comando',
      error: 'Comando não reconhecido. Tente: "criar evento", "listar eventos", "atualizar evento", "deletar evento"'
    };
  }

  // Auxiliares para detectar intenção
  private isCreateIntent(cmd: string): boolean {
    return /criar|agendar|marcar|novo evento/.test(cmd);
  }

  private isUpdateIntent(cmd: string): boolean {
    return /atualizar|editar|modificar|alterar/.test(cmd);
  }

  private isDeleteIntent(cmd: string): boolean {
    return /deletar|remover|cancelar|excluir/.test(cmd);
  }

  private isListIntent(cmd: string): boolean {
    return /listar|mostrar|ver|buscar eventos|agenda/.test(cmd);
  }

  // Extratores (simplificados - você pode melhorar com NLP)
  private async extractAndCreate(command: string, context?: any): Promise<AIAgentResponse> {
    // Se o contexto já tem os dados estruturados, usar diretamente
    if (context?.title && context?.start) {
      return await this.handleCreate(context);
    }
    
    return {
      success: false,
      message: 'Preciso de mais informações para criar o evento',
      error: 'Forneça pelo menos: título e data/hora de início'
    };
  }

  private async extractAndUpdate(command: string, context?: any): Promise<AIAgentResponse> {
    if (context?.eventId && context?.updates) {
      return await this.handleUpdate(context);
    }
    
    return {
      success: false,
      message: 'Preciso do ID do evento e das alterações',
      error: 'Forneça: eventId e campos a atualizar'
    };
  }

  private async extractAndDelete(command: string, context?: any): Promise<AIAgentResponse> {
    if (context?.eventId) {
      return await this.handleDelete(context);
    }
    
    return {
      success: false,
      message: 'Preciso do ID do evento para remover',
      error: 'Forneça: eventId'
    };
  }
}

export const aiAgentGoogleCalendarService = new AIAgentGoogleCalendarService();
