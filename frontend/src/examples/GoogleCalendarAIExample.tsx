import React, { useState } from 'react';
import { useGoogleCalendarAI } from '@/hooks/useGoogleCalendarAI';
import { CalendarEvent } from '@/services/googleCalendarService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Plus, Edit, Trash2, List } from 'lucide-react';

export default function GoogleCalendarAIExample() {
  const {
    isConnected,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    listEvents,
    executeAIAction,
    processAICommand,
    checkConnection,
    clearError
  } = useGoogleCalendarAI();

  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start: '',
    end: '',
    attendees: [],
    location: ''
  });
  const [aiCommand, setAiCommand] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);

  // Exemplo de uso das ações do AI Agent
  const handleAICreateEvent = async () => {
    const result = await processAICommand('criar evento', {
      title: 'Reunião com Cliente - AI Agent',
      description: 'Reunião criada automaticamente pelo AI Agent',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Amanhã + 1h
      attendees: ['cliente@exemplo.com']
    });
    
    setAiResult(result);
    if (result.success) {
      await loadEvents();
    }
  };

  const handleAICommand = async () => {
    const result = await processAICommand(aiCommand, {
      title: 'Evento via comando',
      description: 'Evento criado via comando do AI Agent',
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
    });
    
    setAiResult(result);
    if (result.success && aiCommand.toLowerCase().includes('listar')) {
      await loadEvents();
    }
  };

  const loadEvents = async () => {
    const result = await listEvents();
    if (result.success && result.data?.events) {
      setEvents(result.data.events);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;
    
    const result = await createEvent(newEvent as CalendarEvent);
    if (result.success) {
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        attendees: [],
        location: ''
      });
      await loadEvents();
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Google Calendar não está conectado. Conecte-se nas configurações para usar as funcionalidades.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Google Calendar AI Agent</h1>
        <Badge variant={isConnected ? 'default' : 'secondary'}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Ações do AI Agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Ações do AI Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleAICreateEvent} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento (AI)
            </Button>
            <Button onClick={loadEvents} disabled={loading}>
              <List className="w-4 h-4 mr-2" />
              Listar Eventos
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite um comando para o AI Agent (ex: 'criar reunião amanhã')"
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
            />
            <Button onClick={handleAICommand} disabled={loading || !aiCommand}>
              Executar Comando
            </Button>
          </div>

          {aiResult && (
            <Alert variant={aiResult.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <strong>Resultado:</strong> {aiResult.message || aiResult.error}
                {aiResult.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(aiResult.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Criar Evento Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Evento Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título do evento"
            value={newEvent.title || ''}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          
          <Textarea
            placeholder="Descrição do evento"
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Início</label>
              <Input
                type="datetime-local"
                value={newEvent.start || ''}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fim</label>
              <Input
                type="datetime-local"
                value={newEvent.end || ''}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              />
            </div>
          </div>
          
          <Input
            placeholder="Localização (opcional)"
            value={newEvent.location || ''}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
          
          <Button onClick={handleCreateEvent} disabled={loading || !newEvent.title}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Evento
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600 mt-1">{event.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(event.start).toLocaleString('pt-BR')}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees.length} participante(s)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (event.htmlLink) {
                            window.open(event.htmlLink, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const result = await deleteEvent(event.id);
                          if (result.success) {
                            await loadEvents();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
