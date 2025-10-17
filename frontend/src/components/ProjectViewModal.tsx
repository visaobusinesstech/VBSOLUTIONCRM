import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RightDrawerModal,
  ModalSection,
  PersonalDetailSection,
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
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  ListTodo,
  CheckCircle,
  Circle
} from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useActivities } from '@/hooks/useActivities';

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (projectId: string) => void;
  employees?: any[];
  companies?: any[];
  onOpenActivities?: (project: any) => void;
}

export function ProjectViewModal({
  isOpen,
  onClose,
  project,
  onEdit,
  onDelete,
  employees = [],
  companies = [],
  onOpenActivities
}: ProjectViewModalProps) {
  const [managerProfile, setManagerProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [teamProfiles, setTeamProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [projectActivities, setProjectActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const { getActivitiesByProject } = useActivities();

  // Buscar informações adicionais quando o projeto mudar
  useEffect(() => {
    if (project && isOpen) {
      fetchAdditionalInfo();
      fetchProjectActivities();
    }
  }, [project, isOpen]);

  const fetchAdditionalInfo = async () => {
    if (!project) return;
    
    setLoadingProfiles(true);
    try {
      // Buscar perfil do gerente/responsável
      if (project.manager_id || project.responsible_id) {
        const managerId = project.manager_id || project.responsible_id;
        const { data: manager } = await supabase
          .from('profiles')
          .select('name, avatar_url, position, department')
          .eq('id', managerId)
          .maybeSingle();
        
        if (manager) {
          setManagerProfile(manager);
        }
      }

      // Buscar perfil do criador
      if (project.created_by) {
        const { data: creator } = await supabase
          .from('profiles')
          .select('name, avatar_url, position, department')
          .eq('id', project.created_by)
          .maybeSingle();
        
        if (creator) {
          setCreatorProfile(creator);
        }
      }

      // Buscar perfis da equipe
      if (project.team && Array.isArray(project.team) && project.team.length > 0) {
        const { data: teamMembers } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, position, department')
          .in('id', project.team);
        
        if (teamMembers) {
          setTeamProfiles(teamMembers);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar informações adicionais:', error);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchProjectActivities = async () => {
    if (!project?.id) return;
    
    setLoadingActivities(true);
    try {
      const activities = await getActivitiesByProject(project.id);
      console.log('Atividades carregadas para o projeto:', project.id, activities);
      setProjectActivities(activities || []);
    } catch (error) {
      console.error('Erro ao buscar atividades do projeto:', error);
      setProjectActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
      case 'doing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'Concluído';
      case 'in_progress':
      case 'doing':
        return 'Em Progresso';
      case 'pending':
      case 'todo':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

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

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Não atribuído';
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Não informado';
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

  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Detalhes do Projeto"
      actions={[]}
    >
      {/* Personal Detail Section */}
      <ModalSection>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{project.name || project.title}</h3>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge className={`px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </Badge>
                {project.priority && (
                  <Badge className={`px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {getPriorityLabel(project.priority)}
                  </Badge>
                )}
                {project.category && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200">
                    {project.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalSection>

      {/* Manager and Creator Section */}
      <ModalSection title="Pessoas Envolvidas">
        <div className="space-y-4">
          {/* Gerente/Responsável */}
          {(project.manager_id || project.responsible_id) && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <UserAvatar
                userId={project.manager_id || project.responsible_id}
                userName={project.manager?.name || project.responsible?.name || managerProfile?.name || getEmployeeName(project.manager_id || project.responsible_id)}
                avatarUrl={project.manager?.avatar_url || project.responsible?.avatar_url || managerProfile?.avatar_url}
                size="md"
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Gerente/Responsável</p>
                <p className="text-sm font-semibold text-gray-900">
                  {project.manager?.name || project.responsible?.name || managerProfile?.name || getEmployeeName(project.manager_id || project.responsible_id)}
                </p>
                {managerProfile?.position && (
                  <p className="text-xs text-gray-600">{managerProfile.position}</p>
                )}
                {managerProfile?.department && (
                  <p className="text-xs text-gray-500">{managerProfile.department}</p>
                )}
              </div>
            </div>
          )}

          {/* Criador */}
          {project.created_by && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <UserAvatar
                userId={project.created_by}
                userName={project.creator?.name || creatorProfile?.name}
                avatarUrl={project.creator?.avatar_url || creatorProfile?.avatar_url}
                size="md"
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Criado por</p>
                <p className="text-sm font-semibold text-gray-900">
                  {project.creator?.name || creatorProfile?.name || 'Usuário'}
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
      {project.description && (
        <ModalSection title="Descrição">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </ModalSection>
      )}

      {/* Project Information Section */}
      <ModalSection title="Informações do Projeto">
        <div className="space-y-4">
          {project.company_id && (
            <InfoField
              label="Empresa/Cliente"
              value={getCompanyName(project.company_id)}
              icon={<Building2 className="h-4 w-4 text-gray-500" />}
            />
          )}

          {project.start_date && (
            <InfoField
              label="Data de Início"
              value={formatDate(project.start_date)}
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
            />
          )}

          {project.end_date && (
            <InfoField
              label="Data de Término"
              value={formatDate(project.end_date)}
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
            />
          )}

          {project.due_date && (
            <InfoField
              label="Prazo Final"
              value={formatDate(project.due_date)}
              icon={<Clock className="h-4 w-4 text-gray-500" />}
            />
          )}

          {project.progress !== undefined && project.progress !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Progresso
                </span>
                <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </ModalSection>

      {/* Tags Section */}
      {project.tags && project.tags.length > 0 && (
        <ModalSection title="Tags">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
                {tag}
              </Badge>
            ))}
          </div>
        </ModalSection>
      )}

      {/* Notes Section */}
      {project.notes && (
        <ModalSection title="Notas">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {project.notes}
            </p>
          </div>
        </ModalSection>
      )}

      {/* Budget Section */}
      {(project.budget || project.budget === 0) && (
        <ModalSection title="Informações Financeiras">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs text-green-700">Orçamento Total</p>
              <p className="text-lg font-semibold text-green-800">{formatCurrency(project.budget)}</p>
            </div>
          </div>
        </ModalSection>
      )}

      {/* Team Section */}
      {project.team && project.team.length > 0 && (
        <ModalSection title="Equipe do Projeto">
          <div className="space-y-3">
            {project.team.map((memberId: string, index: number) => {
              const memberProfile = teamProfiles.find(p => p.id === memberId);
              return (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <UserAvatar
                    userId={memberId}
                    userName={memberProfile?.name || getEmployeeName(memberId)}
                    avatarUrl={memberProfile?.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {memberProfile?.name || getEmployeeName(memberId)}
                    </p>
                    {memberProfile?.position && (
                      <p className="text-xs text-gray-600">{memberProfile.position}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalSection>
      )}

      {/* Activities Section */}
      <ModalSection title="Atividades do Projeto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {loadingActivities ? 'Carregando atividades...' : `${projectActivities.length} atividades vinculadas`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenActivities?.(project)}
              className="flex items-center gap-2"
            >
              <ListTodo className="h-4 w-4" />
              Gerenciar Atividades
            </Button>
          </div>
          
          {/* Prévia das atividades */}
          {loadingActivities ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : projectActivities.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projectActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-shrink-0">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.description && activity.description.length > 50 
                        ? `${activity.description.substring(0, 50)}...` 
                        : activity.description || 'Sem descrição'
                      }
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status === 'completed' ? 'Concluída' : 
                       activity.status === 'in_progress' ? 'Em Progresso' : 
                       activity.status === 'pending' ? 'Pendente' : activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {projectActivities.length > 5 && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">
                    +{projectActivities.length - 5} atividades adicionais
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <FileText className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Nenhuma atividade vinculada a este projeto ainda.
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalSection>

      {/* System Information */}
      {(project.created_at || project.updated_at) && (
        <ModalSection title="Informações do Sistema">
          <div className="space-y-4">
            {project.created_at && (
              <InfoField
                label="Criado em"
                value={formatDateTime(project.created_at)}
                icon={<Calendar className="h-4 w-4 text-gray-500" />}
              />
            )}
            {project.updated_at && project.updated_at !== project.created_at && (
              <InfoField
                label="Última Atualização"
                value={formatDateTime(project.updated_at)}
                icon={<Calendar className="h-4 w-4 text-gray-500" />}
              />
            )}
          </div>
        </ModalSection>
      )}

      {/* Botões de ação fixos nos extremos */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <div>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onEdit(project);
                onClose();
              }}
              className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este projeto?')) {
                  onDelete(project.id);
                  onClose();
                }
              }}
              className="h-10 w-10 p-0 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </RightDrawerModal>
  );
}

