import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVB } from '@/contexts/VBContext';
import { useProjects } from '@/hooks/useProjects';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { toast } from '@/hooks/use-toast';
// import { useFilters } from '@/hooks/useFilters';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ProjectCreateModal from '@/components/ProjectCreateModal';
import { ProjectEditModal } from '@/components/ProjectEditModal';
import FilterBar from '@/components/FilterBar';
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
  Trash2
} from 'lucide-react';
import ProjectDeadlineView from '@/components/ProjectDeadlineView';
import BoardKanban from '@/components/BoardKanban';
// import ErrorBoundary from '@/components/ErrorBoundary';

const Projects = () => {
  const { state } = useVB();
  const { companies, employees } = state;
  const { projects, loading, error, createProject, fetchProjects, updateProject } = useProjects();
  
  // Debug logs removidos para evitar problemas
  const { topBarColor } = useTheme();
  const { sidebarExpanded } = useSidebar();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'lista' | 'prazo' | 'planejador' | 'calendario' | 'dashboard'>('board');
  const [prazoViewMode, setPrazoViewMode] = useState<'kanban' | 'lista'>('kanban');
  
  // Debug: verificar viewMode atual
  console.log('🔍 [DEBUG] viewMode atual:', viewMode);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isKanbanEditModalOpen, setIsKanbanEditModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [kanbanColumns, setKanbanColumns] = useState<any[]>([]);
  const [kanbanLoaded, setKanbanLoaded] = useState(false);

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
          { id: 'completed', name: 'CONCLUÍDO', color: '#556B2F', status: 'completed' }
        ]);
        setKanbanLoaded(true);
      }
    } else {
      setKanbanColumns([
        { id: 'planning', name: 'PLANEJAMENTO', color: '#8B7355', status: 'planning' },
        { id: 'active', name: 'EM ANDAMENTO', color: '#6B8E23', status: 'active' },
        { id: 'on_hold', name: 'PAUSADO', color: '#CD853F', status: 'on_hold' },
        { id: 'completed', name: 'CONCLUÍDO', color: '#556B2F', status: 'completed' }
      ]);
      setKanbanLoaded(true);
    }
  }, []);

  // Salvar configurações do Kanban sempre que houver mudanças
  useEffect(() => {
    if (kanbanLoaded && kanbanColumns.length > 0) {
      localStorage.setItem('projectsKanbanColumns', JSON.stringify(kanbanColumns));
    }
  }, [kanbanColumns, kanbanLoaded]);

  // Hook para gerenciar filtros - temporariamente comentado
  // const { filters, updateFilter, clearFilters, getFilterParams } = useFilters();
  
  const navigate = useNavigate();

  // Função para aplicar filtros - temporariamente comentado
  // const applyFilters = async () => {
  //   const filterParams = getFilterParams();
  //   await fetchProjects(filterParams);
  // };

  // const handleFilterApply = () => {
  //   applyFilters();
  // };

  const handleProjectClick = (project: any) => {
    if (typeof project === 'string') {
      navigate(`/projects/${project}`);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      await updateProject(projectId, { status: 'completed' });
      toast({
        title: "Projeto finalizado",
        description: "Projeto foi marcado como concluído"
      });
      fetchProjects();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar projeto",
        variant: "destructive"
      });
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await updateProject(projectId, { archived: true });
      toast({
        title: "Projeto arquivado",
        description: "Projeto foi arquivado com sucesso"
      });
      fetchProjects();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao arquivar projeto",
        variant: "destructive"
      });
    }
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

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (formData: any) => {
    try {
      const result = await updateProject(editingProject.id, formData);
      
      if (result) {
        toast({
          title: "Projeto atualizado",
          description: "Projeto foi atualizado com sucesso"
        });
        setIsEditModalOpen(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    console.log('Excluir projeto:', projectId);
  };

  const handleProjectMove = (taskId: string, fromColumn: string, toColumn: string) => {
    console.log(`Projeto ${taskId} movido de ${fromColumn} para ${toColumn}`);
  };

  const handleMoveProject = async (projectId: string, newColumn: string, newPosition: number) => {
    try {
      // Implementar lógica de movimentação de projeto
      const result = await updateProject(projectId, { status: newColumn });
      
      if (result) {
        toast({
          title: "Projeto movido",
          description: "Projeto foi movido com sucesso",
          duration: 3000,
        });
        return { data: result, error: null };
      }
    } catch (error) {
      console.error('Erro ao mover projeto:', error);
      toast({
        title: "Erro ao mover projeto",
        description: "Não foi possível mover o projeto",
        variant: "destructive",
        duration: 3000,
      });
      return { data: null, error: 'Erro ao mover projeto' };
    }
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

  const handleUpdateKanbanColumn = (columnId: string, updates: any) => {
    setKanbanColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
    
    // Feedback visual para mudanças
    if (updates.name) {
      toast({
        title: "Nome atualizado",
        description: `Etapa renomeada para "${updates.name}"`,
        duration: 2000,
      });
    }
  };

  const handleAddKanbanColumn = () => {
    const newId = `column_${Date.now()}`;
    const newColumn = {
      id: newId,
      name: 'NOVA ETAPA',
      color: 'blue',
      status: newId
    };
    setKanbanColumns(prev => [...prev, newColumn]);
    
    toast({
      title: "Nova etapa adicionada",
      description: "Você pode personalizar o nome e cor da nova etapa",
      duration: 3000,
    });
  };

  const handleRemoveKanbanColumn = (columnId: string) => {
    if (kanbanColumns.length > 1) {
      const columnToRemove = kanbanColumns.find(col => col.id === columnId);
      setKanbanColumns(prev => prev.filter(col => col.id !== columnId));
      
      toast({
        title: "Etapa removida",
        description: `"${columnToRemove?.name}" foi removida do seu Kanban`,
        duration: 3000,
      });
    }
  };

  const handleViewModeChange = (mode: 'board' | 'lista' | 'prazo' | 'planejador' | 'calendario' | 'dashboard') => {
    console.log('🔄 [DEBUG] Mudando viewMode para:', mode);
    setViewMode(mode);
  };


  // Botões de visualização
  const viewButtons = [
    { 
      id: 'board', 
      label: 'Quadro',
      icon: Kanban,
      active: viewMode === 'board'
    },
    {
      id: 'lista', 
      label: 'Lista',
      icon: List,
      active: viewMode === 'lista'
    },
    {
      id: 'prazo', 
      label: 'Prazo',
      icon: Clock,
      active: viewMode === 'prazo'
    },
    {
      id: 'planejador', 
      label: 'Planejador',
      icon: Kanban,
      active: viewMode === 'planejador'
    }
  ];

  // Tratamento de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Faixa branca contínua com botões de navegação e filtros */}
      <div className="bg-white -mt-6 -mx-6">
        {/* Botões de visualização */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                title="Buscar"
              >
                <Search className="h-4 w-4 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsAutomationModalOpen(true)}
                title="Automações"
              >
                <Zap className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* Barra de filtros funcionais - temporariamente comentado */}
        {/* <FilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onApplyFilters={handleFilterApply}
          onClearFilters={clearFilters}
          employees={employees}
          departments={state.settings.departments}
          searchPlaceholder="Filtrar por nome do projeto..."
        /> */}
      </div>

      {/* Container principal com altura total */}
      <div className={`pt-2 h-full ${sidebarExpanded ? 'px-1' : 'px-2'}`}
           style={{height: 'calc(100vh - 72px)'}}>

        {/* Conteúdo baseado na visualização selecionada */}
        {viewMode === 'board' && kanbanLoaded && (
          <div className="w-full">
            {/* Cabeçalho do Kanban Board */}
            <div className="flex items-center justify-end mb-4 mt-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenKanbanEditModal}
                  className="flex items-center text-sm px-3 py-2 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
            
            {/* BoardKanban - Novo design moderno */}
            <BoardKanban
              columns={kanbanColumns}
              tasks={projects.map(project => ({
                ...project,
                title: project.name,
                id: project.id,
                description: project.description,
                priority: project.priority,
                status: project.status,
                due_date: project.due_date,
                dueDate: project.due_date
              }))}
              onTaskMove={handleProjectMove}
              onAddTask={handleOpenCreateModal}
              onTaskClick={handleProjectClick}
              onEditTask={handleEditProject}
              onDeleteTask={handleDeleteProject}
              className="px-3"
            />
          </div>
        )}

        {/* Visualização em Lista */}
        {viewMode === 'lista' && (
          <div className="w-full -ml-2">
            {/* Tabela de Projetos */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Cabeçalho da Tabela */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Lista de Projetos</h3>
                  <p className="text-sm text-gray-600">Visualização em lista dos projetos</p>
                </div>
              </div>
              
              {/* Conteúdo da Lista */}
              <div className="p-6">
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-semibold text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                          project.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.priority === 'high' ? 'bg-red-100 text-red-800' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualização por Prazo */}
        {viewMode === 'prazo' && (
          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Carregando projetos...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Erro ao carregar projetos: {error}</div>
              </div>
            ) : (
              <ProjectDeadlineView 
                projects={Array.isArray(projects) ? projects : []} 
                onProjectClick={handleProjectClick}
                onCompleteProject={handleCompleteProject}
                onArchiveProject={handleArchiveProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onCreateProject={handleOpenCreateModal}
                searchTerm=""
                selectedResponsibles={[]}
                selectedWorkGroup=""
                selectedDepartment=""
                topBarColor={topBarColor}
              />
            )}
          </div>
        )}

        {/* Visualização Planejador */}
        {viewMode === 'planejador' && (
          <div className="planejador-page bg-[#f5f7fb] min-h-screen pl-2 pr-6 py-6">
            {/* Debug: verificar se está renderizando */}
            {console.log('🔍 [DEBUG] Renderizando aba Planejador')}

            {/* Planejamento Kanban */}
            <section className="kanban-section pl-2 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Kanban className="w-5 h-5 text-blue-400" />
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900/85">Planejamento Kanban</h2>
                    <span className="text-xs text-gray-600/85">{projects.length} projetos</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenKanbanEditModal}
                    className="flex items-center text-sm px-3 py-2 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>

              {/* KanbanBoard padrão - mesmo visual da aba Quadro */}
              <BoardKanban
                columns={kanbanColumns}
                tasks={projects.map(project => ({
                  ...project,
                  title: project.name,
                  id: project.id,
                  description: project.description,
                  priority: project.priority,
                  status: project.status,
                  due_date: project.due_date,
                  dueDate: project.due_date
                }))}
                onTaskMove={handleProjectMove}
                onAddTask={handleOpenCreateModal}
                onTaskClick={handleProjectClick}
                onEditTask={handleEditProject}
                onDeleteTask={handleDeleteProject}
                className="px-3"
              />
            </section>
                  </div>
        )}
        
      </div>

      {/* Modais */}
      {isCreateModalOpen && (
        <ProjectCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          companies={companies}
          employees={employees}
        />
      )}

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

      {/* Modal de Edição de Projeto */}
      {isEditModalOpen && editingProject && (
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProject(null);
          }}
          project={editingProject}
          onSubmit={handleUpdateProject}
          companies={companies}
          employees={employees}
        />
      )}

      {/* Modal de edição do Kanban - Layout Moderno e Responsivo */}
      {isKanbanEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseKanbanEditModal}
          />
          
          {/* Modal Content - Design Moderno e Responsivo */}
          <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl border-0 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Header Minimalista */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Personalizar Kanban</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure suas etapas de trabalho de forma personalizada
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseKanbanEditModal}
                  className="w-10 h-10 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content Area - Layout Otimizado */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Seção de Configurações - Layout Horizontal Compacto */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Etapas do Fluxo</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Personalize nomes, cores e organize suas etapas
                      </p>
                    </div>
                    <Button
                      onClick={handleAddKanbanColumn}
                      className="text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6"
                      style={{ backgroundColor: topBarColor }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Etapa
                    </Button>
                  </div>

                  {/* Grid de Colunas - Layout Responsivo e Compacto */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {kanbanColumns.map((column, index) => (
                      <div key={column.id} className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div className="cursor-move text-gray-300 hover:text-gray-500 mt-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>

                          <div className="flex-1 space-y-4">
                            {/* Nome da Etapa */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Etapa</label>
                              <input
                                type="text"
                                value={column.name}
                                onChange={(e) => handleUpdateKanbanColumn(column.id, { name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                placeholder="Nome da etapa"
                              />
                            </div>

                            {/* Seletor de Cores e Contador - Layout Horizontal */}
                            <div className="flex items-center justify-between">
                              {/* Seletor de Cores */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                                <div className="flex gap-2">
                                  {['gray', 'blue', 'green', 'orange', 'red', 'purple'].map((color) => (
                                    <button
                                      key={color}
                                      onClick={() => handleUpdateKanbanColumn(column.id, { color })}
                                      className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                        column.color === color 
                                          ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-300' 
                                          : 'border-gray-200 hover:border-gray-400'
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

                              {/* Contador e Remove Button */}
                              <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                  <span className="font-medium">
                                    {projects.filter(project => {
                                      if (column.status === 'planning') return project.status === 'planning';
                                      if (column.status === 'active') return project.status === 'active';
                                      if (column.status === 'on_hold') return project.status === 'on_hold';
                                      if (column.status === 'completed') return project.status === 'completed';
                                      return project.status === column.status;
                                    }).length}
                                  </span> projetos
                                </div>
                                
                                {/* Remove Button */}
                                {kanbanColumns.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveKanbanColumn(column.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Section - Layout Horizontal Compacto */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview do Kanban</h3>
                  <div className="bg-white rounded-lg p-4 shadow-inner border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {kanbanColumns.map((column) => {
                        const columnStyle = {
                          gray: 'bg-gray-100 border-gray-200 text-gray-700',
                          blue: 'bg-blue-100 border-blue-200 text-blue-700',
                          green: 'bg-green-100 border-green-200 text-green-700',
                          orange: 'bg-orange-100 border-orange-200 text-orange-700',
                          red: 'bg-red-100 border-red-200 text-red-700',
                          purple: 'bg-purple-100 border-purple-200 text-purple-700'
                        }[column.color] || 'bg-gray-100 border-gray-200 text-gray-700';

                        return (
                          <div key={column.id} className={`p-3 rounded-lg border ${columnStyle} transition-all duration-200`}>
                            <div className="text-xs font-semibold mb-1 truncate">{column.name}</div>
                            <div className="text-xs opacity-75">
                              {projects.filter(project => {
                                if (column.status === 'planning') return project.status === 'planning';
                                if (column.status === 'active') return project.status === 'active';
                                if (column.status === 'on_hold') return project.status === 'on_hold';
                                if (column.status === 'completed') return project.status === 'completed';
                                return project.status === column.status;
                              }).length} projetos
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Minimalista */}
            <div className="flex-shrink-0 px-8 py-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Salvamento automático ativo
                </div>
                <Button
                  onClick={handleCloseKanbanEditModal}
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8"
                  style={{ backgroundColor: topBarColor }}
                >
                  Concluído
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
