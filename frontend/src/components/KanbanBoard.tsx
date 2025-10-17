'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Activity } from '@/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Calendar, MessageCircle, Paperclip, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/UserAvatar';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTranslation } from 'react-i18next';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

interface KanbanBoardProps {
  activities: Activity[];
  onMoveActivity: (activityId: string, newColumn: string, newPosition: number) => Promise<{ data: any; error: string | null }>;
  onReindexColumn: (column: string) => Promise<{ data: any; error: string | null }>;
  onAddActivity?: (columnId: string) => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
  onActivityClick?: (activityId: string) => void;
  className?: string;
  columns?: KanbanColumn[]; // Adicionar prop para colunas configuráveis
}

// Colunas serão criadas dinamicamente com traduções

const ActivityCard: React.FC<{
  activity: Activity;
  index: number;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  onClick?: (activityId: string) => void;
}> = ({ activity, index, onEdit, onDelete, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(activity.id)}
    >
      {/* Status bar no topo */}
      <div className={`h-1 w-full rounded-t-lg`} style={{ 
        backgroundColor: activity.status === 'todo' || activity.status === 'pending' || activity.status === 'open' ? '#6B7280' :
        activity.status === 'doing' || activity.status === 'in_progress' ? '#F97316' :
        activity.status === 'done' || activity.status === 'completed' ? '#22C55E' : '#6B7280'
      }} />
      
      <div className="p-3 pb-2">
        {/* Header com título e ações */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1 flex-1">
            <h4 className="text-sm font-medium text-gray-900 leading-tight">
              {activity.title}
            </h4>
            {activity.project && (
              <div className="relative group">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Ver projeto vinculado"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* Tooltip */}
                <div className="absolute left-0 top-6 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Pertence ao Projeto: {activity.project.name}
                </div>
              </div>
            )}
          </div>
          
          {/* Ações visíveis no hover */}
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity);
                }}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                title="Editar atividade"
              >
                <Edit size={12} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(activity.id);
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Excluir atividade"
              >
                <Trash2 size={12} />
              </button>
            )}
            <div className="text-gray-400 cursor-move">
              <GripVertical size={14} />
            </div>
          </div>
        </div>

        {/* Responsável - Logo após o título */}
        {activity.responsible_id && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <UserAvatar
              userId={activity.responsible_id}
              userName={activity.responsible?.name}
              avatarUrl={activity.responsible?.avatar_url}
              size="sm"
              showName={true}
              showTooltip={false}
            />
          </div>
        )}

        {/* Descrição se existir */}
        {activity.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Tags se existirem */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {activity.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {activity.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{activity.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer com metadados */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-gray-400">
            {/* Data de vencimento */}
            {activity.due_date && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span className="text-xs">
                  {formatDate(activity.due_date)}
                </span>
              </div>
            )}

            {/* Comentários */}
            {activity.comments && activity.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle size={12} />
                <span className="text-xs">{activity.comments}</span>
              </div>
            )}

            {/* Anexos */}
            {activity.attachments && activity.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip size={12} />
                <span className="text-xs">{activity.attachments}</span>
              </div>
            )}
          </div>

          {/* Avatar do criador e indicador de prioridade */}
          <div className="flex items-center gap-2">
            {activity.priority && activity.priority !== 'low' && (
              <div 
                className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority)}`}
                title={`Prioridade: ${activity.priority}`}
              />
            )}
            <UserAvatar
              userId={activity.created_by}
              userName={activity.creator?.name}
              avatarUrl={activity.creator?.avatar_url}
              size="xs"
              showTooltip={true}
            />
          </div>
        </div>
      </div>
                      </div>
  );
};

const KanbanColumn: React.FC<{
  column: KanbanColumn;
  activities: Activity[];
  onAddActivity?: (columnId: string) => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
  onActivityClick?: (activityId: string) => void;
  sidebarExpanded?: boolean;
  totalColumns?: number;
}> = ({ column, activities, onAddActivity, onEditActivity, onDeleteActivity, onActivityClick, sidebarExpanded, totalColumns = 3 }) => {
  // Forçar largura fixa para garantir scroll quando há 4+ colunas
  const columnWidth = '300px'; // Largura fixa para todas as colunas
  
  return (
    <div className="flex-shrink-0" style={{ width: columnWidth }}>
      {/* Header da coluna */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            {column.title}
          </h3>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: column.color + '20',
              color: column.color
            }}
          >
            {activities.length}
          </span>
                      </div>
                    </div>

      {/* Lista de tarefas */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
            }`}
          >
            {activities.map((activity, index) => (
              <Draggable
                key={activity.id}
                draggableId={activity.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'opacity-50 scale-95 shadow-xl' : ''}`}
                  >
                    <ActivityCard
                      activity={activity}
                      index={index}
                      onEdit={onEditActivity}
                      onDelete={onDeleteActivity}
                      onClick={onActivityClick}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Botão adicionar tarefa */}
            {onAddActivity && (
              <Button 
                variant="ghost"
                className="w-full h-10 text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg"
                onClick={() => onAddActivity(column.id)}
              >
                <Plus size={16} className="mr-2" />
                Adicionar Tarefa
              </Button>
            )}

            {/* Estado vazio */}
            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">Nenhuma tarefa</div>
            </div>
            )}
      </div>
        )}
      </Droppable>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  activities,
  onMoveActivity,
  onReindexColumn,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onActivityClick,
  className,
  columns
}) => {
  const { sidebarExpanded } = useSidebar();
  const { t } = useTranslation();
  const kanbanContainerRef = useRef<HTMLDivElement>(null);
  // Scrollbar removida - não precisamos mais desses refs

  // Criar colunas com traduções
  const kanbanColumns: KanbanColumn[] = columns || [
    { id: 'todo', title: t('pages.kanban.todo').toUpperCase(), color: '#6B7280' },
    { id: 'doing', title: t('pages.kanban.inProgress').toUpperCase(), color: '#F97316' },
    { id: 'done', title: t('pages.kanban.done').toUpperCase(), color: '#22C55E' }
  ];
  
  // Agrupar atividades por coluna baseado no status
  const groupedActivities = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};
    
    console.log('🔍 [KANBAN] Agrupando atividades:', {
      totalActivities: activities.length,
      activities: activities.map(a => ({ title: a.title, status: a.status, created_by: a.created_by })),
      columns: columns.map(c => ({ id: c.id, title: c.title }))
    });
    
    // Verificar se há atividades com status "pending"
    const pendingActivities = activities.filter(a => a.status === 'pending');
    console.log('🔍 [KANBAN] Atividades com status "pending":', pendingActivities.map(a => ({ title: a.title, status: a.status })));
    
    columns.forEach(column => {
      grouped[column.id] = activities
        .filter(activity => {
          // Mapear status do Supabase para colunas do kanban
          let matches = false;
          
          if (column.id === 'todo' || column.id === 'pending' || column.id === 'open') {
            matches = activity.status === 'pending' || activity.status === 'todo' || activity.status === 'open';
            console.log(`🔍 [KANBAN] Verificando atividade "${activity.title}" (${activity.status}) para coluna "${column.title}" (${column.id}): ${matches}`);
          } else if (column.id === 'doing' || column.id === 'in_progress') {
            matches = activity.status === 'in_progress' || activity.status === 'doing';
          } else if (column.id === 'done' || column.id === 'completed') {
            matches = activity.status === 'completed' || activity.status === 'done';
          } else {
            // Para colunas personalizadas, usar o status diretamente
            matches = activity.status === column.id;
          }
          
          if (matches) {
            console.log(`✅ [KANBAN] Atividade "${activity.title}" (${activity.status}) → Coluna "${column.title}" (${column.id})`);
          }
          
          return matches;
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      console.log(`📋 [KANBAN] Coluna "${column.title}" (${column.id}): ${grouped[column.id].length} atividades`);
    });
    
    return grouped;
  }, [activities, columns]);

  // Função para mover o Kanban diretamente usando transform
  const moveKanban = useCallback((newScrollLeft: number) => {
    if (!kanbanContainerRef.current) return;
    
    const container = kanbanContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const finalScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
    
    // Usar transform em vez de scrollLeft já que removemos overflow
    container.style.transform = `translateX(-${finalScrollLeft}px)`;
  }, []);

  // Função de scrollbar removida

  // useEffect de scrollbar removidos

  // Handlers de scrollbar removidos

  // Função simplificada para drag and drop
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Se não há destino, cancelar
    if (!destination) {
      return;
    }
    
    const sourceColumn = source.droppableId;
    const destinationColumn = destination.droppableId;
    
    // Se não mudou de coluna, cancelar
    if (sourceColumn === destinationColumn) {
      return;
    }
    
    try {
      // Mover atividade para nova coluna
      const result = await onMoveActivity(draggableId, destinationColumn, 0);
      
      if (result.error) {
        console.error('❌ [KANBAN] Erro ao mover atividade:', result.error);
        // O erro já foi tratado no componente pai (Activities.tsx)
        // Aqui apenas logamos para debug
      } else {
      }
    } catch (error) {
      console.error('❌ [KANBAN] Erro inesperado ao mover atividade:', error);
      // O erro já foi tratado no componente pai (Activities.tsx)
      // Aqui apenas logamos para debug
    }
  }, [onMoveActivity]);

  // Ajustar gap baseado no estado da sidebar e número de colunas
  const gap = sidebarExpanded || columns.length >= 5 ? 'gap-2' : 'gap-3';
  
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          ref={kanbanContainerRef}
          className={cn("flex pb-2", gap)}
        >
          {kanbanColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              activities={groupedActivities[column.id] || []}
              onAddActivity={onAddActivity}
              onEditActivity={onEditActivity}
              onDeleteActivity={onDeleteActivity}
              onActivityClick={onActivityClick}
              sidebarExpanded={sidebarExpanded}
              totalColumns={columns.length}
            />
          ))}
        </div>
      </DragDropContext>
      
      {/* Scrollbar removida - não precisamos mais dela */}
      
      {/* Estilos de scrollbar removidos */}
    </div>
  );
};

export default KanbanBoard;
