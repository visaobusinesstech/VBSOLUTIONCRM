import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  project?: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  };
}

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
    status: string;
  };
  activities: Activity[];
  onActivityClick: (activityId: string) => void;
  onOpenCreateModal: () => void;
  renderActivityActions: (activity: Activity) => React.ReactNode;
}

export default function KanbanColumn({
  column,
  activities,
  onActivityClick,
  onOpenCreateModal,
  renderActivityActions
}: KanbanColumnProps) {
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-[#FEE2E2] text-[#B91C1C]',
      high: 'bg-[#FEF3C7] text-[#D97706]',
      medium: 'bg-[#DBEAFE] text-[#1E40AF]',
      low: 'bg-[#D1FAE5] text-[#059669]'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    };
    return texts[priority as keyof typeof texts] || 'Média';
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg min-h-fit flex flex-col">
      <div className="p-4 border-b border-[#E5E7EB] border-t-2 hover:shadow-md hover:scale-[1.01] transition-all duration-200" style={{ borderTopColor: column.color }}>
        <div className="flex items-center justify-between">
          <h3 className="font-inter text-[12px] text-[#374151]">{column.title}</h3>
          <span className="font-inter text-[11px] text-[#6B7280]">
            {activities.length}
          </span>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <Draggable key={activity.id} draggableId={activity.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group relative bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      }`}
                      onClick={() => onActivityClick(activity.id)}
                    >
                      {renderActivityActions(activity)}
                      <div className="flex items-center gap-1 mb-2 pr-8">
                        <h4 className="font-inter text-[14px] text-[#111827]">{activity.title}</h4>
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
                      
                      <p className="font-inter text-[12px] text-[#6B7280] mb-3">
                        {activity.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[12px] px-1.5 py-1 rounded ${getPriorityColor(activity.priority)}`}>
                          {getPriorityText(activity.priority)}
                        </span>
                        <div className="flex items-center text-[12px] text-[#6B7280]">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          <span className="font-inter">
                            {activity.due_date ? new Date(activity.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nenhuma atividade
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="p-3 border-t border-[#E5E7EB]">
        <button 
          className="w-full h-9 font-inter text-[12px] text-[#6B7280] border border-dashed border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          onClick={onOpenCreateModal}
        >
          + NOVA TAREFA
        </button>
      </div>
    </div>
  );
}
