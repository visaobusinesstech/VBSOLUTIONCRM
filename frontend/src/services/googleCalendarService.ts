// Serviço para executar ações do Google Calendar via AI Agent

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  attendees?: string[]; // Array de emails
  location?: string;
}

export interface CalendarActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class GoogleCalendarService {
  private baseUrl = 'http://localhost:3000';

  // Verificar se Google está conectado
  async isConnected(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/integrations/google/status`);
      const data = await response.json();
      return data.success && data.data.connected;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  // Criar evento
  async createEvent(event: CalendarEvent): Promise<CalendarActionResult> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        return {
          success: false,
          error: 'Google Calendar não está conectado'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/ai-agent/google-calendar/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      const data = await response.json();
      
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        message: data.data?.message || 'Evento criado com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return {
        success: false,
        error: 'Erro ao criar evento no Google Calendar'
      };
    }
  }

  // Atualizar evento
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarActionResult> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        return {
          success: false,
          error: 'Google Calendar não está conectado'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/ai-agent/google-calendar/update-event/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      const data = await response.json();
      
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        message: data.data?.message || 'Evento atualizado com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return {
        success: false,
        error: 'Erro ao atualizar evento no Google Calendar'
      };
    }
  }

  // Deletar evento
  async deleteEvent(eventId: string): Promise<CalendarActionResult> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        return {
          success: false,
          error: 'Google Calendar não está conectado'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/ai-agent/google-calendar/delete-event/${eventId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        message: data.message || 'Evento deletado com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return {
        success: false,
        error: 'Erro ao deletar evento do Google Calendar'
      };
    }
  }

  // Listar eventos
  async listEvents(): Promise<CalendarActionResult> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        return {
          success: false,
          error: 'Google Calendar não está conectado'
        };
      }

      const response = await fetch(`${this.baseUrl}/api/ai-agent/google-calendar/list-events`);

      const data = await response.json();
      
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        message: data.data?.message || 'Eventos listados com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      return {
        success: false,
        error: 'Erro ao listar eventos do Google Calendar'
      };
    }
  }

  // Executar ação do AI Agent
  async executeAIAgentAction(actionType: 'create' | 'update' | 'delete' | 'list', params: any = {}): Promise<CalendarActionResult> {
    switch (actionType) {
      case 'create':
        return this.createEvent(params);
      case 'update':
        return this.updateEvent(params.eventId, params.event);
      case 'delete':
        return this.deleteEvent(params.eventId);
      case 'list':
        return this.listEvents();
      default:
        return {
          success: false,
          error: 'Tipo de ação não suportado'
        };
    }
  }

  // Processar comando do AI Agent
  async processAICommand(command: string, params: any = {}): Promise<CalendarActionResult> {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('criar') || lowerCommand.includes('agendar') || lowerCommand.includes('marcar')) {
      return this.executeAIAgentAction('create', params);
    }
    
    if (lowerCommand.includes('atualizar') || lowerCommand.includes('editar') || lowerCommand.includes('modificar')) {
      return this.executeAIAgentAction('update', params);
    }
    
    if (lowerCommand.includes('deletar') || lowerCommand.includes('remover') || lowerCommand.includes('cancelar')) {
      return this.executeAIAgentAction('delete', params);
    }
    
    if (lowerCommand.includes('listar') || lowerCommand.includes('mostrar') || lowerCommand.includes('ver')) {
      return this.executeAIAgentAction('list', params);
    }

    return {
      success: false,
      error: 'Comando não reconhecido'
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
