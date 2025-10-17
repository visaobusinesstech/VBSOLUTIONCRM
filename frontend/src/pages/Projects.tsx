import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVB } from '@/contexts/VBContext';
import { useProjects } from '@/hooks/useProjects';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRightDrawer } from '@/contexts/RightDrawerContext';
import { toast } from '@/hooks/use-toast';
import { useFilters } from '@/hooks/useFilters';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import ProjectCreateModal from '@/components/ProjectCreateModal';
import ProjectEditModal from '@/components/ProjectEditModal';
import KanbanEditModal from '@/components/KanbanEditModal';
import { ProjectActivitiesModal } from '@/components/ProjectActivitiesModal';
import FilterBar from '@/components/FilterBar';
import { ProjectViewModal } from '@/components/ProjectViewModal';
import { RightDrawerModal, ModalSection } from '@/components/ui/right-drawer-modal';
import { 
  Search,
  Plus,
  Eye,
  User,
  Share,
  MoreHorizontal,
  Kanban,
  List,
  Clock,
  Calendar,
  BarChart3,
  X,
  Zap,
  ArrowUpDown,
  Building2,
  Edit,
  Trash2,
  AlignJustify,
  DollarSign,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { UploadButton } from '@/components/UploadButton';
import { Badge } from '@/components/ui/badge';
import ProjectDeadlineView from '@/components/ProjectDeadlineView';
import ClickUpKanban from '@/components/ClickUpKanban';
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard';
import ProjectsDashboardCharts from '@/components/ProjectsDashboardCharts';
import ProjectsDashboardFilters from '@/components/ProjectsDashboardFilters';

const Projects = () => {
  const { t } = useTranslation();
  const { state } = useVB();
  const { companies = [], employees = [] } = state || {};
  const { projects, loading, error, createProject, updateProject, deleteProject, fetchProjects } = useProjects();
  
  // Garantir que projects seja sempre um array válido
  const safeProjects = Array.isArray(projects) ? projects : [];
  const { topBarColor } = useTheme();
  const { sidebarExpanded, setSidebarExpanded, showMenuButtons, expandSidebarFromMenu } = useSidebar();
  const { isRightDrawerOpen } = useRightDrawer();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'board' | 'lista' | 'prazo' | 'calendario' | 'dashboard'>('board');
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isKanbanEditModalOpen, setIsKanbanEditModalOpen] = useState(false);
  const [isKanbanConfigModalOpen, setIsKanbanConfigModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [activitiesProject, setActivitiesProject] = useState<any>(null);
  const [kanbanColumns, setKanbanColumns] = useState<any[]>([]);
  const [kanbanLoaded, setKanbanLoaded] = useState(false);
  
  // Garantir que kanbanColumns seja sempre um array válido
  const safeKanbanColumns = Array.isArray(kanbanColumns) ? kanbanColumns : [];
  const [profiles, setProfiles] = useState<{[key: string]: string}>({});
  
  // Estados para fullscreen
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenLayout, setFullscreenLayout] = useState<'fit' | 'scroll'>('fit');
  
  // Estados para filtros do Dashboard
  const [dashboardFilters, setDashboardFilters] = useState({
    dateRange: 'all',
    status: 'all',
    priority: 'all',
    responsible: 'all',
    budget: 'all'
  });

  // Funções para fullscreen customizado (não usa API nativa do browser)
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  const toggleFullscreenLayout = () => {
    setFullscreenLayout(prev => (prev === 'fit' ? 'scroll' : 'fit'));
  };

  // Handlers
  const handleProjectClick = (projectId: string) => {
    const project = safeProjects.find(p => p.id === projectId);
    if (project) {
      setViewingProject(project);
      setIsViewModalOpen(true);
    }
  };

  const handleViewModalEdit = (project: any) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };


  // Funções para o ProjectKanbanBoard
  const handleMoveProject = async (projectId: string, newColumn: string, newPosition: number) => {
    try {
      // Mapear as colunas do Kanban para os status dos projetos
      let newStatus = newColumn;
      
      // Verificar se é uma coluna personalizada
      const customColumn = safeKanbanColumns.find(col => col.id === newColumn);
      if (customColumn && customColumn.status) {
        newStatus = customColumn.status;
      } else {
        // Mapeamento para colunas padrão
        if (newColumn === 'planning') newStatus = 'planning';
        else if (newColumn === 'active') newStatus = 'active';
        else if (newColumn === 'on_hold') newStatus = 'on_hold';
        else if (newColumn === 'completed') newStatus = 'completed';
        else if (newColumn === 'cancelled') newStatus = 'cancelled';
      }

      const result = await updateProject(projectId, { status: newStatus });
      
      if (result.error) {
        toast({
          title: "Erro ao mover projeto",
          description: result.error,
          variant: "destructive",
        });
        return { data: null, error: result.error };
      }

      toast({
        title: "Projeto movido",
        description: "Projeto movido com sucesso",
      });

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao mover projeto:', error);
      return { data: null, error: 'Erro ao mover projeto' };
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (formData: any) => {
    try {
      if (!editingProject) return;

      console.log('🔄 [UPDATE] Dados recebidos do formulário:', formData);
      console.log('🔄 [UPDATE] Projeto sendo editado:', editingProject);
      
      // Verificar se há dados problemáticos
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        console.log(`🔍 [UPDATE] Campo ${key}:`, value, typeof value);
      });

      // Usar apenas campos essenciais - mesma lógica que funcionou para atividades
      const updateData: any = {
        name: formData.name?.trim() || editingProject.name,
        description: formData.description?.trim() || null,
        status: formData.status || editingProject.status,
        priority: formData.priority || editingProject.priority
      };

      // Adicionar apenas campos opcionais se válidos
      if (formData.start_date) {
        try {
          updateData.start_date = new Date(formData.start_date).toISOString();
        } catch (error) {
          console.warn('⚠️ [UPDATE] Data de início inválida:', formData.start_date);
        }
      }

      if (formData.due_date) {
        try {
          // Tabela usa end_date; aceitar due_date do formulário e mapear
          updateData.end_date = new Date(formData.due_date).toISOString();
        } catch (error) {
          console.warn('⚠️ [UPDATE] Data de vencimento inválida:', formData.due_date);
        }
      }

      if (formData.budget && !isNaN(parseFloat(formData.budget.toString()))) {
        updateData.budget = parseFloat(formData.budget.toString());
      }

      // Campos progress e notes não existem no schema atual de projects; omitidos

      console.log('🔄 [UPDATE] Dados de atualização preparados:', { 
        id: editingProject.id, 
        updateData
      });

      const result = await updateProject(editingProject.id, updateData);
      
      if (result && !result.error) {
        console.log('✅ [UPDATE] Projeto atualizado com sucesso:', result.data);
        
        toast({
          title: "Projeto atualizado",
          description: "Projeto foi atualizado com sucesso"
        });
        
        setIsEditModalOpen(false);
        setEditingProject(null);
      } else if (result && result.error) {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ [UPDATE] Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar projeto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await deleteProject(projectId);
      
      if (result.error) {
        toast({
          title: "Erro ao excluir projeto",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Projeto excluído",
        description: "Projeto excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro ao excluir projeto",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };


  // Carregar configurações do Kanban salvas
  useEffect(() => {
    const savedKanbanConfig = localStorage.getItem('projectsKanbanColumns');
    if (savedKanbanConfig) {
      try {
        const parsedConfig = JSON.parse(savedKanbanConfig);
        setKanbanColumns(parsedConfig);
        setKanbanLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar configurações do Kanban:', error);
        setKanbanColumns([
          { id: 'planning', name: 'PLANEJAMENTO', color: '#8B7355', status: 'planning' },
          { id: 'active', name: 'EM ANDAMENTO', color: '#6B8E23', status: 'active' },
          { id: 'on_hold', name: 'PAUSADO', color: '#CD853F', status: 'on_hold' },
          { id: 'completed', name: 'CONCLUÍDO', color: '#556B2F', status: 'completed' },
          { id: 'cancelled', name: 'CANCELADO', color: '#DC2626', status: 'cancelled' }
        ]);
        setKanbanLoaded(true);
      }
    } else {
      setKanbanColumns([
        { id: 'planning', name: 'PLANEJAMENTO', color: '#8B7355', status: 'planning' },
        { id: 'active', name: 'EM ANDAMENTO', color: '#6B8E23', status: 'active' },
        { id: 'on_hold', name: 'PAUSADO', color: '#CD853F', status: 'on_hold' },
        { id: 'completed', name: 'CONCLUÍDO', color: '#556B2F', status: 'completed' },
        { id: 'cancelled', name: 'CANCELADO', color: '#DC2626', status: 'cancelled' }
      ]);
      setKanbanLoaded(true);
    }
    
    // Carregar perfis
    loadProfiles();
  }, []);

  // Salvar configurações do Kanban sempre que houver mudanças
  useEffect(() => {
    if (kanbanLoaded && safeKanbanColumns.length > 0) {
      localStorage.setItem('projectsKanbanColumns', JSON.stringify(safeKanbanColumns));
    }
  }, [safeKanbanColumns, kanbanLoaded]);

  // Funções para gerenciar colunas do Kanban
  const handleAddKanbanColumn = () => {
    const newColumn = {
      id: `column_${Date.now()}`,
      name: 'NOVA ETAPA',
      color: '#6B7280',
      status: 'new'
    };
    setKanbanColumns([...safeKanbanColumns, newColumn]);
  };

  const handleRemoveKanbanColumn = (columnId: string) => {
    if (safeKanbanColumns.length > 1) {
      const columnToRemove = safeKanbanColumns.find(col => col.id === columnId);
      setKanbanColumns(safeKanbanColumns.filter(col => col.id !== columnId));
      
      toast({
        title: "Etapa removida",
        description: `"${columnToRemove?.name}" foi removida do seu Kanban`,
        duration: 3000,
      });
    }
  };

  const handleUpdateKanbanColumn = (columnId: string, fieldOrUpdates: string | any, value?: string) => {
    setKanbanColumns(safeKanbanColumns.map(col => {
      if (col.id === columnId) {
        if (typeof fieldOrUpdates === 'string' && value !== undefined) {
          // Chamada com field e value: handleUpdateKanbanColumn(id, 'name', 'Novo Nome')
          return { ...col, [fieldOrUpdates]: value };
        } else {
          // Chamada com updates object: handleUpdateKanbanColumn(id, { name: 'Novo Nome' })
          return { ...col, ...fieldOrUpdates };
        }
      }
      return col;
    }));
  };

  // Hook para gerenciar filtros
  const { filters, updateFilter, clearFilters, getFilterParams } = useFilters();
  
  const navigate = useNavigate();

  // Função para aplicar filtros
  const applyFilters = async () => {
    const filterParams = getFilterParams();
    await fetchProjects(filterParams);
  };

  const handleFilterApply = () => {
    applyFilters();
  };

  const handleCreateProject = async (formData: any) => {
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        status: formData.status as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        budget: formData.budget || undefined,
        company_id: formData.company_id || undefined,
        manager_id: formData.manager_id || undefined
      };

      const result = await createProject(projectData);
      
      if (result) {
        toast({
          title: "Projeto criado",
          description: "Projeto foi criado com sucesso"
        });
        setIsCreateModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar projeto",
        variant: "destructive"
      });
    }
  };

  // Função para importação em massa de projetos via Excel
  const handleImportProjects = async (data: any[]) => {
    try {
      console.log('📊 [IMPORT] Iniciando importação de', data.length, 'projetos');

      // Filtrar apenas linhas com dados válidos
      const validData = data.filter(row => {
        return row.name && row.name.trim() !== '' && row.name.trim() !== 'Exemplo';
      });

      console.log(`📊 [IMPORT] Dados válidos: ${validData.length} de ${data.length} total`);

      if (validData.length === 0) {
        throw new Error('Nenhum dado válido encontrado para importar');
      }

      // Processar dados importados
      const projectsData = await Promise.all(validData.map(async (row) => {
        // Buscar empresa pelo nome, se fornecido
        let company_id = undefined;
        if (row.company_name) {
          const company = companies.find(c => 
            c.fantasyName?.toLowerCase().includes(row.company_name.toLowerCase()) ||
            c.legalName?.toLowerCase().includes(row.company_name.toLowerCase())
          );
          if (company) {
            company_id = company.id;
          }
        }

        // Processar status - sempre usar 'planning' para projetos sem status definido
        let processedStatus = 'planning'; // Status padrão que corresponde a "PLANEJAMENTO" no Kanban
        if (row.status && row.status !== 'Exemplo' && row.status.trim() !== '') {
          const statusMap: { [key: string]: string } = {
            'planejamento': 'planning',
            'ativo': 'active',
            'em andamento': 'active',
            'pausado': 'on_hold',
            'concluído': 'completed',
            'cancelado': 'cancelled'
          };
          processedStatus = statusMap[row.status.toLowerCase()] || 'planning';
        }

        // Processar prioridade
        let processedPriority = 'medium';
        if (row.priority && row.priority !== 'Exemplo' && row.priority.trim() !== '') {
          const priorityMap: { [key: string]: string } = {
            'baixa': 'low',
            'média': 'medium', 
            'alta': 'high',
            'urgente': 'urgent'
          };
          processedPriority = priorityMap[row.priority.toLowerCase()] || 'medium';
        }

        const projectData = {
          name: row.name,
          description: row.description || '',
          status: processedStatus as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
          priority: processedPriority as 'low' | 'medium' | 'high' | 'urgent',
          start_date: row.start_date || undefined,
          due_date: row.due_date || undefined,
          budget: row.budget || undefined,
          currency: row.currency || 'BRL',
          progress: row.progress || 0,
          company_id,
          notes: row.notes || ''
        };
        
        console.log('🔍 [IMPORT] Dados do projeto individual:', projectData);
        return projectData;
      }));

      console.log('📤 [IMPORT] Dados preparados para inserção:', projectsData);

      // Inserir todos os projetos no Supabase
      const { data: insertedProjects, error } = await supabase
        .from('projects')
        .insert(projectsData)
        .select();

      if (error) {
        console.error('❌ [IMPORT] Erro no Supabase:', error);
        throw error;
      }

      console.log('✅ [IMPORT] Projetos importados com sucesso:', insertedProjects);

      // Recarregar projetos para atualizar todas as visualizações
      console.log('🔄 [IMPORT] Recarregando projetos...');
      await fetchProjects();
      console.log('✅ [IMPORT] Projetos recarregados');

      toast({
        title: "Importação concluída",
        description: `${insertedProjects?.length || 0} projetos foram importados com sucesso`
      });

    } catch (error) {
      console.error('❌ [IMPORT] Erro ao importar projetos:', error);
      throw error;
    }
  };

  const handleProjectMove = (taskId: string, fromColumn: string, toColumn: string) => {
    console.log(`Projeto ${taskId} movido de ${fromColumn} para ${toColumn}`);
  };

  const handleOpenCreateModal = (columnId?: string) => {
    setIsCreateModalOpen(true);
  };

  const handleOpenKanbanEditModal = () => {
    setIsKanbanEditModalOpen(true);
  };

  const handleCloseKanbanEditModal = () => {
    setIsKanbanEditModalOpen(false);
  };

  // Funções para gerenciar filtros do Dashboard
  const handleDashboardFilterChange = (key: string, value: string) => {
    setDashboardFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearDashboardFilters = () => {
    setDashboardFilters({
      dateRange: 'all',
      status: 'all',
      priority: 'all',
      responsible: 'all',
      budget: 'all'
    });
  };

  const handleRefreshDashboard = () => {
    fetchProjects();
  };




  const handleViewModeChange = (mode: 'board' | 'lista' | 'prazo' | 'calendario' | 'dashboard') => {
    setViewMode(mode);
  };

  // Função para carregar perfis
  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name');
      
      if (error) throw error;
      
      const profilesMap: {[key: string]: string} = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile.name;
      });
      setProfiles(profilesMap);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  // Função para obter nome do perfil
  const getProfileName = (profileId: string) => {
    return profiles[profileId] || profileId;
  };

  // Botões de visualização
  const viewButtons = useMemo(() => [
    { 
      id: 'board', 
      label: t('pages.projects.viewModes.board'),
      icon: Kanban,
      active: viewMode === 'board'
    },
    {
      id: 'lista', 
      label: t('pages.projects.viewModes.list'),
      icon: List,
      active: viewMode === 'lista'
    },
    {
      id: 'prazo', 
      label: t('pages.projects.viewModes.deadline'),
      icon: Clock,
      active: viewMode === 'prazo'
    },
    {
      id: 'calendario', 
      label: t('pages.projects.viewModes.calendar'),
      icon: Calendar,
      active: viewMode === 'calendario'
    },
    {
      id: 'dashboard', 
      label: t('pages.projects.viewModes.dashboard'),
      icon: BarChart3,
      active: viewMode === 'dashboard'
    }
  ], [viewMode, t]);

  // Tratamento de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar projetos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
                     <Button onClick={() => fetchProjects()} variant="outline">
             Tentar novamente
           </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header fixo responsivo ao sidebar - Esconde em fullscreen */}
      {!isFullscreen && (
        <div 
          className="fixed top-[38px] right-0 bg-white border-b border-gray-200 z-30 transition-all duration-300"
          style={{
            left: sidebarExpanded ? '240px' : '64px'
          }}
        >
        {/* Botões de visualização */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão fixo de toggle da sidebar */}
              {showMenuButtons && !sidebarExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 flex-shrink-0"
                  onClick={expandSidebarFromMenu}
                  title="Expandir barra lateral"
                >
                  <AlignJustify size={14} />
                </Button>
              )}
              
              {viewButtons.map((button) => {
                const Icon = button.icon;
                return (
                <Button
                    key={button.id}
                    variant="ghost"
                  size="sm"
                    onClick={() => handleViewModeChange(button.id as any)}
                  className={`
                      h-10 px-4 text-sm font-medium transition-all duration-200 rounded-lg
                      ${button.active 
                        ? 'bg-gray-50 text-slate-900 shadow-inner' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-gray-25'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {button.label}
                </Button>
                );
              })}
            </div>
            
            {/* Botões de ação na extrema direita */}
            <div className="flex items-center gap-2">
              {/* Botão de Tela Cheia - apenas para visualizações Kanban */}
              {(viewMode === 'board' || viewMode === 'prazo') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={toggleFullscreen}
                  title="Tela cheia"
                >
                  <Maximize2 className="h-4 w-4 text-gray-700" />
                </Button>
              )}
              
              {/* Botão de Upload/Importação Excel */}
              <UploadButton
                entityType="projects"
                onImportComplete={handleImportProjects}
                title="Importar planilha Excel de projetos"
              />
              
              {/* Botão de configuração do Kanban - apenas para abas com Kanban */}
              {(viewMode === 'board' || viewMode === 'prazo') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsKanbanConfigModalOpen(true)}
                  title="Configurar Kanban"
                >
                  <Settings className="h-4 w-4 text-gray-700" />
                </Button>
              )}
              
            </div>
          </div>
        </div>

          {/* Barra de filtros funcionais - não exibir na aba Dashboard */}
          {viewMode !== 'dashboard' && (
            <FilterBar
              filters={filters}
              onFilterChange={updateFilter}
              onApplyFilters={handleFilterApply}
              onClearFilters={clearFilters}
              employees={employees}
              departments={state.settings.departments}
              searchPlaceholder="Filtrar por nome do projeto..."
            />
          )}
        </div>
      )}

      {/* Container principal com padding para o header fixo */}
      <div 
        className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 dark:bg-black' : `px-1 ${viewMode === 'dashboard' ? 'pt-[60px]' : 'pt-[140px]'}`}`} 
        style={{minHeight: 'calc(100vh - 38px)'}}
      >

        {/* Conteúdo baseado na visualização selecionada */}
        {viewMode === 'board' && kanbanLoaded && (
          <div className={`w-full ${isFullscreen ? 'h-full flex flex-col p-4' : ''}`}>
            
             {/* ProjectKanbanBoard - Kanban para Projetos */}
            <ProjectKanbanBoard
              projects={safeProjects}
               onMoveProject={handleMoveProject}
               onReindexColumn={async () => ({ data: null, error: null })}
               onAddProject={handleOpenCreateModal}
               onEditProject={handleEditProject}
               onDeleteProject={handleDeleteProject}
               onProjectClick={handleProjectClick}
               className={isFullscreen ? 'flex-1' : 'px-3'}
               columns={safeKanbanColumns}
            />
          </div>
        )}

        {/* Visualização em Lista */}
        {viewMode === 'lista' && (
          <div className="w-full">
            {/* Tabela de Projetos */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Cabeçalho da Tabela */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center px-3 py-3 gap-2">
                  <div className="flex-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>Projeto</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-24 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-24 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                    <span>Prazo</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-28 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                    <span>Responsável</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-24 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                    <span>Orçamento</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-24 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                    <span>Prioridade</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="w-20 flex items-center justify-end gap-2 text-sm font-medium text-gray-700">
                    <span>Ações</span>
                  </div>
                </div>
              </div>

              {/* Linhas da Tabela */}
              <div className="divide-y divide-gray-200">
                {safeProjects.length > 0 ? (
                  safeProjects.map((project) => (
                    <div key={project.id} className="flex items-center px-3 py-3 h-14 hover:bg-gray-50 transition-colors gap-2">
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-gray-900 truncate font-medium">{project.name}</span>
                          <span className="text-xs text-gray-400">
                            {project.description || 'Sem descrição'}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 flex items-center justify-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1 py-0.5 border font-medium ${
                            project.status === 'planning' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                            project.status === 'active' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            project.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                            {project.status === 'planning' ? 'Pendente' :
                           project.status === 'active' ? 'Ativo' :
                             project.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                        </div>
                      <div className="w-24 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <span className="text-xs">
                          {project.end_date ? new Date(project.end_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          }) : 'Sem prazo'}
                        </span>
                      </div>
                      <div className="w-28 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <span className="truncate max-w-20">
                          {project.responsible_id || 'Não atribuído'}
                        </span>
                      </div>
                      <div className="w-24 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <span className="text-xs">
                          {project.budget ? `R$ ${project.budget.toLocaleString()}` : 'Sem orçamento'}
                        </span>
                      </div>
                      <div className="w-24 flex items-center justify-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1 py-0.5 border font-medium ${
                          project.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                          project.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          project.priority === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {project.priority === 'urgent' ? 'Urgente' :
                           project.priority === 'high' ? 'Alta' :
                           project.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <div className="w-20 flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                          onClick={() => handleProjectClick(project.id)}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-all duration-200 h-6 w-6"
                          title="Visualizar projeto"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                            onClick={() => handleEditProject(project)}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-all duration-200 h-6 w-6"
                          title="Editar projeto"
                          >
                          <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-all duration-200 h-6 w-6"
                          title="Excluir projeto"
                          >
                          <Trash2 className="h-3 w-3" />
                          </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Nenhum projeto encontrado
                  </div>
                )}
              </div>
            </div>

            {/* Espaço branco inferior */}
            <div className="h-32 bg-[#F9FAFB]"></div>
          </div>
        )}

        {/* Visualização por Prazo */}
        {viewMode === 'prazo' && (
          <div className={`w-full projects-prazo-view ${isFullscreen ? 'h-full flex flex-col p-4' : ''}`}>
            <ProjectDeadlineView 
              projects={safeProjects}
              onProjectClick={handleProjectClick}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onCreateProject={handleOpenCreateModal}
              isFullscreen={isFullscreen}
            />
          </div>
        )}

        {/* Visualização Calendário */}
        {viewMode === 'calendario' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visualização Calendário</h3>
            <p className="text-gray-600">Implementar visualização calendário</p>
          </div>
        )}

        {/* Visualização Dashboard */}
        {viewMode === 'dashboard' && (
          <div className="dashboard-page bg-[#f5f7fb] min-h-screen -mx-6 px-6 -mt-2 pb-6" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            {/* Filtros do Dashboard */}
            <div className="mb-4">
              <ProjectsDashboardFilters
                filters={dashboardFilters}
                onFilterChange={handleDashboardFilterChange}
                projects={safeProjects}
                employees={employees}
              />
            </div>

            {/* Gráficos do Dashboard */}
            <ProjectsDashboardCharts
              projects={safeProjects}
              filters={dashboardFilters}
            />
          </div>
        )}

                </div>

      {/* Botão flutuante de novo projeto - esconde em fullscreen e quando modal direito estiver aberto */}
      {!isFullscreen && !isRightDrawerOpen && (
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-colors duration-200"
          style={{
            backgroundColor: '#021529',
            borderColor: '#021529'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#001122';
            e.currentTarget.style.borderColor = '#001122';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#021529';
            e.currentTarget.style.borderColor = '#021529';
          }}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Modais */}
                <ProjectCreateModal
          isOpen={isCreateModalOpen}
                  onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          companies={companies}
          employees={employees}
                />

      {/* Modal de Automações */}
      {isAutomationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAutomationModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Automatize</h2>
                <button
                  onClick={() => setIsAutomationModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Espaço para futuras automações</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição do Kanban */}
      {isKanbanEditModalOpen && (
        <KanbanEditModal
          isOpen={isKanbanEditModalOpen}
          onClose={handleCloseKanbanEditModal}
          columns={safeKanbanColumns}
          projects={safeProjects}
          onUpdateColumn={handleUpdateKanbanColumn}
          onRemoveColumn={handleRemoveKanbanColumn}
          onAddColumn={handleAddKanbanColumn}
        />
      )}


      {/* Modal de Configuração do Kanban */}
      <RightDrawerModal
        open={isKanbanConfigModalOpen}
        onClose={() => setIsKanbanConfigModalOpen(false)}
        title="Configure seu Kanban"
      >
        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-blue-800">
                Edite os nomes das etapas, escolha cores e reorganize a ordem. Você pode adicionar novas etapas ou remover as existentes. Suas configurações são salvas automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Colunas */}
        <ModalSection>
          <div className="space-y-3">
            {/* Título das Etapas */}
            <h3 className="text-sm font-medium text-gray-700 mb-3">Etapas do Kanban</h3>

            <div className="space-y-3">
              {safeKanbanColumns.map((column, index) => (
                <div key={column.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="space-y-3">
                    {/* Nome da Coluna */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Nome</label>
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => handleUpdateKanbanColumn(column.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da etapa"
                      />
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Cor</label>
                      <div className="flex gap-2">
                        {['gray', 'blue', 'green', 'orange', 'red', 'purple'].map((color) => (
                          <button
                            key={color}
                            onClick={() => handleUpdateKanbanColumn(column.id, 'color', color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              column.color === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                            } ${
                              color === 'gray' ? 'bg-gray-500' :
                              color === 'blue' ? 'bg-blue-500' :
                              color === 'green' ? 'bg-green-500' :
                              color === 'orange' ? 'bg-orange-500' :
                              color === 'red' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Status e Ações */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {projects.filter(project => {
                          const statusMap = {
                            'planning': 'planning',
                            'active': 'active', 
                            'on_hold': 'on_hold',
                            'completed': 'completed',
                            'cancelled': 'cancelled'
                          };
                          return statusMap[project.status] === column.status;
                        }).length} projetos
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botão Adicionar Etapa - apenas no último bloco */}
                        {index === safeKanbanColumns.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAddKanbanColumn}
                            className="text-white bg-[#021529] hover:bg-[#031a35] w-8 h-8 p-0 rounded-full flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Botão Remover */}
                        {kanbanColumns.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKanbanColumn(column.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalSection>

        {/* Preview */}
        <ModalSection title="Preview">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex flex-col gap-2">
              {safeKanbanColumns.map((column) => {
                const columnStyle = {
                  gray: 'bg-gray-200 border-gray-300',
                  blue: 'bg-blue-200 border-blue-300',
                  green: 'bg-green-200 border-green-300',
                  orange: 'bg-orange-200 border-orange-300',
                  red: 'bg-red-200 border-red-300',
                  purple: 'bg-purple-200 border-purple-300'
                }[column.color] || 'bg-gray-200 border-gray-300';

                return (
                  <div key={column.id} className={`p-3 rounded border ${columnStyle}`}>
                    <div className="text-xs font-medium text-gray-700 mb-1">{column.name}</div>
                    <div className="text-xs text-gray-500">
                      {projects.filter(project => {
                        const statusMap = {
                          'planning': 'planning',
                          'active': 'active', 
                          'on_hold': 'on_hold',
                          'completed': 'completed',
                          'cancelled': 'cancelled'
                        };
                        return statusMap[project.status] === column.status;
                      }).length} projetos
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalSection>
      </RightDrawerModal>

      {/* Modal de edição de projeto */}
      {isEditModalOpen && editingProject && (
        <ProjectEditModal
                  isOpen={isEditModalOpen}
                  project={editingProject}
                  companies={companies}
                  employees={employees}
                  onSubmit={handleUpdateProject}
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                  }}
                />
      )}

      {/* Botão para sair da tela cheia - aparece apenas quando em fullscreen */}
      {isFullscreen && (viewMode === 'board' || viewMode === 'prazo') && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-gray-200 rounded-full transition-all duration-200 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl"
            onClick={exitFullscreen}
            title="Sair da tela cheia"
          >
            <Minimize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      )}

      {/* Modal de Visualização de Projeto */}
      <ProjectViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProject(null);
        }}
        project={viewingProject}
        onEdit={handleViewModalEdit}
        onDelete={deleteProject}
        employees={employees}
        companies={companies}
        onOpenActivities={(project) => {
          console.log('Abrindo modal de atividades para projeto:', project);
          setActivitiesProject(project);
          setIsActivitiesModalOpen(true);
        }}
      />

      {/* Modal de Atividades do Projeto */}
      <ProjectActivitiesModal
        isOpen={isActivitiesModalOpen}
        onClose={() => {
          setIsActivitiesModalOpen(false);
          setActivitiesProject(null);
        }}
        project={activitiesProject}
        employees={employees}
        companies={companies}
      />
    </div>
  );
};

export default Projects;
