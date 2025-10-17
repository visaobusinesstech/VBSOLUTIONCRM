import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RightDrawerModal,
  ModalSection,
  InfoField
} from '@/components/ui/right-drawer-modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  Save,
  X,
  ListTodo,
  FileText,
  Settings
} from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  employees?: any[];
  companies?: any[];
}

export function ProjectActivitiesModal({
  isOpen,
  onClose,
  project,
  employees = [],
  companies = []
}: ProjectActivitiesModalProps) {
  const { 
    getActivitiesByProject, 
    createProjectActivity, 
    updateProjectActivity, 
    deleteProjectActivity 
  } = useActivities();
  const { updateProject } = useProjects();
  
  const [activities, setActivities] = useState<any[]>([]);
  
  // Garantir que activities seja sempre um array válido
  const safeActivities = Array.isArray(activities) ? activities : [];
  const [loading, setLoading] = useState(false);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  
  // Estados do formulário de atividade
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    responsible_id: '',
    estimated_hours: '',
    notes: ''
  });
  
  // Estados do formulário de projeto
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    due_date: '',
    responsible_id: '',
    notes: ''
  });

  // Carregar atividades do projeto
  useEffect(() => {
    if (isOpen && project?.id) {
      loadProjectActivities();
    }
  }, [isOpen, project?.id]);

  // Inicializar formulário do projeto
  useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        due_date: project.due_date ? format(new Date(project.due_date), 'yyyy-MM-dd') : '',
        responsible_id: project.responsible_id || '',
        notes: project.notes || ''
      });
    }
  }, [project]);

  const loadProjectActivities = async () => {
    if (!project?.id) return;
    
    setLoading(true);
    try {
      const activities = await getActivitiesByProject(project.id);
      setActivities(Array.isArray(activities) ? activities : []);
    } catch (error) {
      console.error('Erro ao carregar atividades do projeto:', error);
      toast.error('Erro ao carregar atividades do projeto');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id) return;

    try {
      const activityData = {
        ...activityForm,
        estimated_hours: activityForm.estimated_hours ? parseFloat(activityForm.estimated_hours) : null
      };

      const { data, error } = await createProjectActivity(project.id, activityData);
      if (error) {
        toast.error('Erro ao criar atividade');
        return;
      }

      toast.success('Atividade criada com sucesso!');
      setActivityForm({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        responsible_id: '',
        estimated_hours: '',
        notes: ''
      });
      setIsCreatingActivity(false);
      loadProjectActivities();
    } catch (error) {
      toast.error('Erro ao criar atividade');
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    try {
      const activityData = {
        ...activityForm,
        estimated_hours: activityForm.estimated_hours ? parseFloat(activityForm.estimated_hours) : null
      };

      const { data, error } = await updateProjectActivity(editingActivity.id, activityData);
      if (error) {
        toast.error('Erro ao atualizar atividade');
        return;
      }

      toast.success('Atividade atualizada com sucesso!');
      setEditingActivity(null);
      setActivityForm({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        responsible_id: '',
        estimated_hours: '',
        notes: ''
      });
      loadProjectActivities();
    } catch (error) {
      toast.error('Erro ao atualizar atividade');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      const { error } = await deleteProjectActivity(activityId);
      if (error) {
        toast.error('Erro ao excluir atividade');
        return;
      }

      toast.success('Atividade excluída com sucesso!');
      loadProjectActivities();
    } catch (error) {
      toast.error('Erro ao excluir atividade');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id) return;

    try {
      const projectData = {
        ...projectForm,
        due_date: projectForm.due_date || null
      };

      const { data, error } = await updateProject(project.id, projectData);
      if (error) {
        toast.error('Erro ao atualizar projeto');
        return;
      }

      toast.success('Projeto atualizado com sucesso!');
      setIsEditingProject(false);
      onClose(); // Fechar modal para recarregar dados
    } catch (error) {
      toast.error('Erro ao atualizar projeto');
    }
  };

  const startEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title || '',
      description: activity.description || '',
      type: activity.type || 'task',
      priority: activity.priority || 'medium',
      status: activity.status || 'pending',
      due_date: activity.due_date ? format(new Date(activity.due_date), 'yyyy-MM-dd') : '',
      responsible_id: activity.responsible_id || '',
      estimated_hours: activity.estimated_hours?.toString() || '',
      notes: activity.notes || ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  console.log('ProjectActivitiesModal renderizando:', { isOpen, project: project?.name });
  
  if (!isOpen || !project) {
    console.log('ProjectActivitiesModal não renderizado:', { isOpen, hasProject: !!project });
    return null;
  }

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title={`Gerenciar Atividades - ${project.name}`}
    >
      {/* Header Actions */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditingProject(!isEditingProject)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditingProject ? 'Cancelar' : 'Editar Projeto'}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsCreatingActivity(!isCreatingActivity)}
          className="flex items-center gap-2 text-white"
        >
          <Plus className="h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      {/* Formulário de edição do projeto */}
      {isEditingProject && (
        <ModalSection title="Editar Projeto">
          <form onSubmit={handleUpdateProject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project-name">Nome do Projeto</Label>
                      <Input
                        id="project-name"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-status">Status</Label>
                      <Select
                        value={projectForm.status}
                        onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planejamento</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="project-priority">Prioridade</Label>
                      <Select
                        value={projectForm.priority}
                        onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="project-due-date">Data de Vencimento</Label>
                      <Input
                        id="project-due-date"
                        type="date"
                        value={projectForm.due_date}
                        onChange={(e) => setProjectForm({ ...projectForm, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="project-description">Descrição</Label>
                    <Textarea
                      id="project-description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditingProject(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Projeto
                    </Button>
                  </div>
                </form>
        </ModalSection>
      )}

      {/* Formulário de criação/edição de atividade */}
      {(isCreatingActivity || editingActivity) && (
        <ModalSection title={editingActivity ? 'Editar Atividade' : 'Nova Atividade'}>
                <form onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity-title">Título</Label>
                      <Input
                        id="activity-title"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-type">Tipo</Label>
                      <Select
                        value={activityForm.type}
                        onValueChange={(value) => setActivityForm({ ...activityForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Tarefa</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="call">Ligação</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="activity-priority">Prioridade</Label>
                      <Select
                        value={activityForm.priority}
                        onValueChange={(value) => setActivityForm({ ...activityForm, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="activity-status">Status</Label>
                      <Select
                        value={activityForm.status}
                        onValueChange={(value) => setActivityForm({ ...activityForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="activity-due-date">Data de Vencimento</Label>
                      <Input
                        id="activity-due-date"
                        type="date"
                        value={activityForm.due_date}
                        onChange={(e) => setActivityForm({ ...activityForm, due_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-responsible">Responsável</Label>
                      <Select
                        value={activityForm.responsible_id}
                        onValueChange={(value) => setActivityForm({ ...activityForm, responsible_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="activity-hours">Horas Estimadas</Label>
                      <Input
                        id="activity-hours"
                        type="number"
                        step="0.5"
                        value={activityForm.estimated_hours}
                        onChange={(e) => setActivityForm({ ...activityForm, estimated_hours: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activity-description">Descrição</Label>
                    <Textarea
                      id="activity-description"
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity-notes">Observações</Label>
                    <Textarea
                      id="activity-notes"
                      value={activityForm.notes}
                      onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatingActivity(false);
                        setEditingActivity(null);
                        setActivityForm({
                          title: '',
                          description: '',
                          type: 'task',
                          priority: 'medium',
                          status: 'pending',
                          due_date: '',
                          responsible_id: '',
                          estimated_hours: '',
                          notes: ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="text-white">
                      <Save className="h-4 w-4 mr-2" />
                      {editingActivity ? 'Atualizar' : 'Criar'} Atividade
                    </Button>
                  </div>
                </form>
        </ModalSection>
      )}

      {/* Lista de atividades */}
      <ModalSection title={`Atividades do Projeto (${safeActivities.length})`}>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
              {safeActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade encontrada para este projeto.</p>
                  <p className="text-sm">Clique em "Nova Atividade" para criar a primeira.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeActivities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(activity.status)}
                            <h4 className="font-medium">{activity.title}</h4>
                            <Badge className={getPriorityColor(activity.priority)}>
                              {activity.priority}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {activity.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(activity.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                            )}
                            {activity.responsible && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.responsible.name}
                              </div>
                            )}
                            {activity.estimated_hours && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.estimated_hours}h
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditActivity(activity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
      </ModalSection>
    </RightDrawerModal>
  );
}
