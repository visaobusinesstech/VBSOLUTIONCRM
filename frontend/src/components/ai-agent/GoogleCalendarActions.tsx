import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  List, 
  MessageSquare,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { useAIAgentGoogleCalendar } from '@/hooks/useAIAgentGoogleCalendar';

interface GoogleCalendarActionsProps {
  className?: string;
}

export function GoogleCalendarActions({ className }: GoogleCalendarActionsProps) {
  const { loading, error, executeAction, processCommand, clearError } = useAIAgentGoogleCalendar();
  
  // Estados para formulários
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
    attendees: ''
  });
  
  const [updateForm, setUpdateForm] = useState({
    eventId: '',
    title: '',
    description: '',
    start: '',
    end: '',
    location: ''
  });
  
  const [deleteForm, setDeleteForm] = useState({
    eventId: ''
  });
  
  const [naturalCommand, setNaturalCommand] = useState('');

  // Ações do AI Agent
  const handleCreateEvent = async () => {
    if (!createForm.title || !createForm.start) {
      alert('Preencha pelo menos o título e data de início');
      return;
    }

    const attendees = createForm.attendees
      ? createForm.attendees.split(',').map(email => email.trim())
      : [];

    await executeAction({
      action: 'create',
      params: {
        title: createForm.title,
        description: createForm.description,
        start: createForm.start,
        end: createForm.end,
        location: createForm.location,
        attendees
      }
    });
  };

  const handleUpdateEvent = async () => {
    if (!updateForm.eventId) {
      alert('Preencha o ID do evento');
      return;
    }

    const updates: any = {};
    if (updateForm.title) updates.title = updateForm.title;
    if (updateForm.description) updates.description = updateForm.description;
    if (updateForm.start) updates.start = updateForm.start;
    if (updateForm.end) updates.end = updateForm.end;
    if (updateForm.location) updates.location = updateForm.location;

    await executeAction({
      action: 'update',
      params: {
        eventId: updateForm.eventId,
        updates
      }
    });
  };

  const handleDeleteEvent = async () => {
    if (!deleteForm.eventId) {
      alert('Preencha o ID do evento');
      return;
    }

    await executeAction({
      action: 'delete',
      params: {
        eventId: deleteForm.eventId
      }
    });
  };

  const handleListEvents = async () => {
    await executeAction({
      action: 'list',
      params: {}
    });
  };

  const handleNaturalCommand = async () => {
    if (!naturalCommand.trim()) {
      alert('Digite um comando');
      return;
    }

    await processCommand(naturalCommand);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">AI Agent - Google Calendar</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Integração Ativa
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Limpar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Comando em Linguagem Natural */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comando em Linguagem Natural
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Ex: 'criar reunião amanhã às 14h com o cliente João'"
              value={naturalCommand}
              onChange={(e) => setNaturalCommand(e.target.value)}
            />
            <div className="text-sm text-gray-500">
              Exemplos: "criar evento", "listar eventos", "atualizar evento", "deletar evento"
            </div>
          </div>
          <Button
            onClick={handleNaturalCommand}
            disabled={loading || !naturalCommand.trim()}
            className="w-full"
          >
            {loading ? 'Processando...' : 'Executar Comando'}
          </Button>
        </CardContent>
      </Card>

      {/* Criar Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Criar Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título do evento *"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />
          <Textarea
            placeholder="Descrição"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Início *</label>
              <Input
                type="datetime-local"
                value={createForm.start}
                onChange={(e) => setCreateForm({ ...createForm, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fim</label>
              <Input
                type="datetime-local"
                value={createForm.end}
                onChange={(e) => setCreateForm({ ...createForm, end: e.target.value })}
              />
            </div>
          </div>
          <Input
            placeholder="Localização"
            value={createForm.location}
            onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
          />
          <Input
            placeholder="Participantes (emails separados por vírgula)"
            value={createForm.attendees}
            onChange={(e) => setCreateForm({ ...createForm, attendees: e.target.value })}
          />
          <Button
            onClick={handleCreateEvent}
            disabled={loading || !createForm.title || !createForm.start}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </Button>
        </CardContent>
      </Card>

      {/* Atualizar Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Atualizar Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="ID do evento *"
            value={updateForm.eventId}
            onChange={(e) => setUpdateForm({ ...updateForm, eventId: e.target.value })}
          />
          <Input
            placeholder="Novo título"
            value={updateForm.title}
            onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
          />
          <Textarea
            placeholder="Nova descrição"
            value={updateForm.description}
            onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Novo início</label>
              <Input
                type="datetime-local"
                value={updateForm.start}
                onChange={(e) => setUpdateForm({ ...updateForm, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Novo fim</label>
              <Input
                type="datetime-local"
                value={updateForm.end}
                onChange={(e) => setUpdateForm({ ...updateForm, end: e.target.value })}
              />
            </div>
          </div>
          <Input
            placeholder="Nova localização"
            value={updateForm.location}
            onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
          />
          <Button
            onClick={handleUpdateEvent}
            disabled={loading || !updateForm.eventId}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Atualizando...' : 'Atualizar Evento'}
          </Button>
        </CardContent>
      </Card>

      {/* Deletar Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Deletar Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="ID do evento *"
            value={deleteForm.eventId}
            onChange={(e) => setDeleteForm({ ...deleteForm, eventId: e.target.value })}
          />
          <Button
            onClick={handleDeleteEvent}
            disabled={loading || !deleteForm.eventId}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deletando...' : 'Deletar Evento'}
          </Button>
        </CardContent>
      </Card>

      {/* Listar Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-purple-600" />
            Listar Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleListEvents}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Listando...' : 'Listar Eventos'}
          </Button>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Agent Google Calendar: Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Endpoints: Funcionando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Linguagem Natural: Disponível</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
