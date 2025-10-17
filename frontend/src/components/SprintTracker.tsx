import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, Maximize2, Calendar, Users, Archive, Trash2, MoreVertical, Plus, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SprintDetails from './SprintDetails';
import { useSupabaseSprints, Sprint } from '@/hooks/useSupabaseSprints';

interface SprintTrackerProps {
  onExpandView: () => void;
  activities?: any[];
  companies?: any[];
  employees?: any[];
  onActivityClick?: (activityId: string) => void;
}

const SprintTracker = ({ 
  onExpandView, 
  activities = [], 
  companies = [], 
  employees = [], 
  onActivityClick 
}: SprintTrackerProps) => {
  const { toast } = useToast();
  const { 
    sprints, 
    loading, 
    createSprint, 
    iniciarSprint,
    finalizarSprint, 
    deletarSprint,
    getAtividadesDaSprint 
  } = useSupabaseSprints();

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showSprintDetails, setShowSprintDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [novoNomeSprint, setNovoNomeSprint] = useState('');
  const [sprintActivities, setSprintActivities] = useState<any[]>([]);

  // Encontrar sprint ativa
  const activeSprint = sprints.find(s => s.status === 'em_andamento');
  const completedSprints = sprints.filter(s => s.status === 'finalizada').length;
  const totalSprints = sprints.length;

  // Função para criar nova sprint
  const handleCreateSprint = async () => {
    if (!novoNomeSprint.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para a sprint',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSprint(novoNomeSprint.trim());
      setNovoNomeSprint('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
    }
  };

  // Função para iniciar sprint
  const handleStartSprint = async (sprintId: string) => {
    try {
      console.log('🚀 Iniciando sprint:', sprintId);
      await iniciarSprint(sprintId);
      console.log('✅ Sprint iniciada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar sprint:', error);
    }
  };

  // Função para finalizar sprint
  const handleCompleteSprint = async (sprintId: string) => {
    try {
      console.log('🏁 Finalizando sprint:', sprintId);
      await finalizarSprint(sprintId);
      console.log('✅ Sprint finalizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao finalizar sprint:', error);
    }
  };

  // Função para deletar sprint
  const handleDeleteSprint = async (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;

    if (sprint.status === 'em_andamento') {
      return; // Não permite deletar sprint em andamento (validação já existe no hook)
    }

    await deletarSprint(sprintId);
  };

  // Função para abrir detalhes da sprint
  const handleSprintClick = async (sprint: Sprint) => {
    setSelectedSprint(sprint);
    const atividades = await getAtividadesDaSprint(sprint.id);
    setSprintActivities(atividades);
    setShowSprintDetails(true);
  };

  const handleCloseSprintDetails = () => {
    setShowSprintDetails(false);
    setSelectedSprint(null);
    setSprintActivities([]);
  };

  // Calcular estatísticas da sprint
  const getSprintStats = (sprint: Sprint, activities: any[]) => {
    const sprintActivities = activities.filter(a => a.sprint_id === sprint.id);
    const completedTasks = sprintActivities.filter(a => 
      a.status === 'completed' || a.status === 'done' || a.status === 'finalizada'
    ).length;
    const totalTasks = sprintActivities.length;
    
    return { completedTasks, totalTasks };
  };

  if (loading) {
    return (
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Acompanhamento de Sprints</h3>
            <p className="text-sm text-gray-600">Carregando sprints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Acompanhamento de Sprints</h3>
            <p className="text-sm text-gray-600">
              {completedSprints} de {totalSprints} sprints finalizadas
              {activeSprint && (
                <span className="ml-2 text-gray-500">
                  • Sprint ativa: {activeSprint.nome}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Iniciar Sprint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Nova Sprint</DialogTitle>
                  <DialogDescription>
                    {activeSprint 
                      ? `Já existe uma sprint em andamento: "${activeSprint.nome}". Finalize-a antes de iniciar uma nova.`
                      : 'Digite o nome da nova sprint para começar.'
                    }
                  </DialogDescription>
                </DialogHeader>
                {!activeSprint && (
                  <>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Ex: Sprint 1 - Desenvolvimento de Features"
                        value={novoNomeSprint}
                        onChange={(e) => setNovoNomeSprint(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateSprint();
                          }
                        }}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateSprint}
                        disabled={!novoNomeSprint.trim()}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Sprint
                      </Button>
                    </DialogFooter>
                  </>
                )}
                {activeSprint && (
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Fechar
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={onExpandView}
            className="flex items-center gap-2 border-gray-200"
          >
            <Maximize2 className="h-4 w-4" />
            Expandir Visualização
          </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {sprints.map((sprint) => {
            const { completedTasks, totalTasks } = getSprintStats(sprint, activities);
            
            return (
            <Card 
              key={sprint.id} 
              className="bg-white border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 cursor-pointer relative group"
              onClick={() => handleSprintClick(sprint)}
            >
              {/* Sprint Actions Dropdown */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white/80 hover:bg-white shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSprint(sprint.id);
                      }}
                      className="text-xs text-red-600 focus:text-red-600"
                        disabled={sprint.status === 'em_andamento'}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate pr-8">{sprint.nome}</h4>
                    {sprint.status === 'finalizada' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progresso</span>
                      <span>{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                          sprint.status === 'finalizada' ? 'bg-green-500' :
                          sprint.status === 'em_andamento' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                        style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>
                        {new Date(sprint.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        {sprint.data_fim && (
                          <> - {new Date(sprint.data_fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</>
                        )}
                    </span>
                  </div>

                  {/* Activities count */}
                    {totalTasks > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3 w-3" />
                        <span>{totalTasks} atividades</span>
                    </div>
                  )}

                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      sprint.status === 'finalizada' ? 'border-green-200 text-green-700 bg-green-50' :
                      sprint.status === 'em_andamento' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      'border-gray-200 text-gray-700 bg-gray-50'
                    }`}
                  >
                      {sprint.status === 'finalizada' ? 'Finalizada' : 
                       sprint.status === 'em_andamento' ? 'Em Andamento' : 'Planejada'}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                      {sprint.status === 'em_andamento' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteSprint(sprint.id)}
                        className="text-xs h-6 px-2 bg-white border-green-200 text-green-600 hover:bg-green-50"
                      >
                        Finalizar Sprint
                      </Button>
                    )}
                      {sprint.status === 'planejada' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartSprint(sprint.id)}
                        className="text-xs h-6 px-2 bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        Iniciar Sprint
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Sprint Details Modal */}
      {showSprintDetails && selectedSprint && (
        <SprintDetails
          sprint={selectedSprint}
          activities={sprintActivities}
          companies={companies}
          employees={employees}
          onClose={handleCloseSprintDetails}
          onActivityClick={onActivityClick || (() => {})}
        />
      )}
    </>
  );
};

export default SprintTracker;
