import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RightDrawerModal,
  ModalSection,
  InfoField
} from '@/components/ui/right-drawer-modal';
import { 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  Tag,
  FileText,
  Edit,
  Trash2,
  Users,
  Briefcase,
  FolderOpen,
  Target,
  Link2,
  Unlink
} from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSprints } from '@/hooks/useSupabaseSprints';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ActivitySprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  onEdit?: (activity: any) => void;
  onDelete?: (activityId: string) => void;
  employees?: any[];
  companies?: any[];
}

export function ActivitySprintModal({
  isOpen,
  onClose,
  activity,
  onEdit,
  onDelete,
  employees = [],
  companies = []
}: ActivitySprintModalProps) {
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [responsibleProfile, setResponsibleProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [sprintInfo, setSprintInfo] = useState<any>(null);
  
  // Hook para gerenciar sprints
  const { sprints, vincularAtividade } = useSupabaseSprints();
  const { toast } = useToast();

  // Buscar informações adicionais quando a atividade mudar
  useEffect(() => {
    if (activity && isOpen) {
      fetchAdditionalInfo();
    }
  }, [activity, isOpen]);

  const fetchAdditionalInfo = async () => {
    if (!activity) return;
    
    setLoadingProfiles(true);
    try {
      // Buscar informações do projeto se houver
      if (activity.project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('name, description, status')
          .eq('id', activity.project_id)
          .maybeSingle();
        
        if (project) {
          setProjectInfo(project);
        }
      }

      // Buscar informações da sprint se houver
      if (activity.sprint_id) {
        const { data: sprint } = await supabase
          .from('sprints')
          .select('nome, data_inicio, data_fim, status')
          .eq('id', activity.sprint_id)
          .maybeSingle();
        
        if (sprint) {
          setSprintInfo(sprint);
        }
      }

      // Buscar perfil do responsável
      if (activity.responsible_id) {
        const { data: responsible } = await supabase
          .from('profiles')
          .select('name, avatar_url, position, department')
          .eq('id', activity.responsible_id)
          .maybeSingle();
        
        if (responsible) {
          setResponsibleProfile(responsible);
        }
      }

      // Buscar perfil do criador
      if (activity.created_by) {
        const { data: creator } = await supabase
          .from('profiles')
          .select('name, avatar_url, position, department')
          .eq('id', activity.created_by)
          .maybeSingle();
        
        if (creator) {
          setCreatorProfile(creator);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar informações adicionais:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Função para vincular/desvincular atividade de uma sprint
  const handleSprintChange = async (sprintId: string) => {
    if (!activity?.id) return;
    
    try {
      const newSprintId = sprintId === 'none' ? null : sprintId;
      await vincularAtividade(activity.id, newSprintId);
      
      // Atualizar informações da sprint
      if (newSprintId) {
        const sprint = sprints.find(s => s.id === newSprintId);
        if (sprint) {
          setSprintInfo(sprint);
        }
      } else {
        setSprintInfo(null);
      }
    } catch (error) {
      console.error('Erro ao vincular atividade:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao vincular atividade à sprint',
        variant: 'destructive',
      });
    }
  };

  if (!activity) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'doing':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo':
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'Concluída';
      case 'doing':
      case 'in-progress':
        return 'Em Progresso';
      case 'todo':
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Não atribuído';
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || company?.fantasyName || company?.fantasy_name || 'Não informado';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Detalhes da Atividade"
      id={`ID #${activity.id?.slice(-6) || 'N/A'}`}
      actions={[
        ...(onEdit ? [{
          label: "Editar",
          variant: "outline" as const,
          onClick: () => {
            onEdit(activity);
            onClose();
          },
          icon: <Edit className="h-4 w-4" />
        }] : []),
        ...(onDelete ? [{
          label: "Excluir",
          variant: "destructive" as const,
          onClick: () => {
            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
              onDelete(activity.id);
              onClose();
            }
          },
          icon: <Trash2 className="h-4 w-4" />
        }] : [])
      ]}
    >
      {/* Personal Detail Section */}
      <ModalSection title="Informações Gerais">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge className={`px-2.5 py-0.5 text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusLabel(activity.status)}
                </Badge>
                <Badge className={`px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ModalSection>

      {/* Sprint Management Section */}
      <ModalSection title="Gestão de Sprint">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Sprint Vinculada</label>
            <Select
              value={activity.sprint_id || 'none'}
              onValueChange={handleSprintChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Unlink className="h-4 w-4" />
                    <span>Nenhuma sprint</span>
                  </div>
                </SelectItem>
                {sprints
                  .filter(s => s.status === 'em_andamento')
                  .map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span>{sprint.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {sprintInfo && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{sprintInfo.nome}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Iniciada em {new Date(sprintInfo.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      {sprintInfo.status === 'em_andamento' ? 'Em Andamento' : 'Finalizada'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalSection>

      {/* Responsible and Creator Section */}
      <ModalSection title="Pessoas Envolvidas">
        <div className="space-y-4">
          {/* Responsável */}
          {activity.responsible_id && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <UserAvatar
                userId={activity.responsible_id}
                userName={activity.responsible?.name || responsibleProfile?.name || getEmployeeName(activity.responsible_id)}
                avatarUrl={activity.responsible?.avatar_url || responsibleProfile?.avatar_url}
                size="md"
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Responsável</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activity.responsible?.name || responsibleProfile?.name || getEmployeeName(activity.responsible_id)}
                </p>
                {responsibleProfile?.position && (
                  <p className="text-xs text-gray-600">{responsibleProfile.position}</p>
                )}
                {responsibleProfile?.department && (
                  <p className="text-xs text-gray-500">{responsibleProfile.department}</p>
                )}
              </div>
            </div>
          )}

          {/* Criador */}
          {activity.created_by && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <UserAvatar
                userId={activity.created_by}
                userName={activity.creator?.name || creatorProfile?.name}
                avatarUrl={activity.creator?.avatar_url || creatorProfile?.avatar_url}
                size="md"
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Criado por</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activity.creator?.name || creatorProfile?.name || 'Usuário'}
                </p>
                {creatorProfile?.position && (
                  <p className="text-xs text-gray-600">{creatorProfile.position}</p>
                )}
                {creatorProfile?.department && (
                  <p className="text-xs text-gray-500">{creatorProfile.department}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalSection>

      {/* Description Section */}
      {activity.description && (
        <ModalSection title="Descrição">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {activity.description}
            </p>
          </div>
        </ModalSection>
      )}

      {/* Activity Information Section */}
      <ModalSection title="Informações da Atividade">
        <div className="space-y-4">
          {activity.company_id && (
            <InfoField
              label="Empresa/Cliente"
              value={getCompanyName(activity.company_id)}
              icon={<Building2 className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.project_id && projectInfo && (
            <InfoField
              label="Projeto Vinculado"
              value={
                <div className="flex flex-col">
                  <span className="font-medium">{projectInfo.name}</span>
                  {projectInfo.description && (
                    <span className="text-xs text-gray-500 line-clamp-1">{projectInfo.description}</span>
                  )}
                </div>
              }
              icon={<FolderOpen className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.work_group && (
            <InfoField
              label="Grupo de Trabalho"
              value={activity.work_group}
              icon={<Users className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.department && (
            <InfoField
              label="Departamento"
              value={activity.department}
              icon={<Briefcase className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.type && (
            <InfoField
              label="Tipo de Atividade"
              value={
                activity.type === 'task' ? 'Tarefa' :
                activity.type === 'meeting' ? 'Reunião' :
                activity.type === 'call' ? 'Ligação' :
                activity.type === 'email' ? 'Email' :
                activity.type
              }
              icon={<Tag className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.start_date && (
            <InfoField
              label="Data de Início"
              value={formatDate(activity.start_date)}
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.end_date && (
            <InfoField
              label="Data de Término"
              value={formatDate(activity.end_date)}
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
            />
          )}

          {activity.due_date && (
            <InfoField
              label="Prazo"
              value={formatDateTime(activity.due_date)}
              icon={<Clock className="h-4 w-4 text-gray-500" />}
            />
          )}

          {(activity.estimated_hours || activity.actual_hours) && (
            <div className="grid grid-cols-2 gap-4">
              {activity.estimated_hours && (
                <InfoField
                  label="Horas Estimadas"
                  value={`${activity.estimated_hours}h`}
                  icon={<Clock className="h-4 w-4 text-gray-500" />}
                />
              )}
              {activity.actual_hours && (
                <InfoField
                  label="Horas Reais"
                  value={`${activity.actual_hours}h`}
                  icon={<Clock className="h-4 w-4 text-gray-500" />}
                />
              )}
            </div>
          )}

          {activity.progress !== undefined && activity.progress !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Progresso</span>
                <span className="text-sm font-semibold text-gray-900">{activity.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${activity.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </ModalSection>

      {/* Tags Section */}
      {activity.tags && activity.tags.length > 0 && (
        <ModalSection title="Tags">
          <div className="flex flex-wrap gap-2">
            {activity.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
                {tag}
              </Badge>
            ))}
          </div>
        </ModalSection>
      )}

      {/* Notes Section */}
      {activity.notes && (
        <ModalSection title="Notas">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {activity.notes}
            </p>
          </div>
        </ModalSection>
      )}

      {/* System Information */}
      {(activity.created_at || activity.updated_at) && (
        <ModalSection title="Informações do Sistema">
          <div className="space-y-4">
            {activity.created_at && (
              <InfoField
                label="Criado em"
                value={formatDateTime(activity.created_at)}
                icon={<Calendar className="h-4 w-4 text-gray-500" />}
              />
            )}
            {activity.updated_at && activity.updated_at !== activity.created_at && (
              <InfoField
                label="Última Atualização"
                value={formatDateTime(activity.updated_at)}
                icon={<Calendar className="h-4 w-4 text-gray-500" />}
              />
            )}
          </div>
        </ModalSection>
      )}
    </RightDrawerModal>
  );
}
