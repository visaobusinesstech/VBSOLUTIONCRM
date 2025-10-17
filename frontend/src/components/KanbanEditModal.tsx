import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RightDrawerModal,
  ModalSection
} from '@/components/ui/right-drawer-modal';
import { 
  Save,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';

interface KanbanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
  projects: any[];
  onUpdateColumn: (columnId: string, fieldOrUpdates: string | any, value?: string) => void;
  onRemoveColumn: (columnId: string) => void;
  onAddColumn: () => void;
}

export function KanbanEditModal({
  isOpen,
  onClose,
  columns,
  projects,
  onUpdateColumn,
  onRemoveColumn,
  onAddColumn
}: KanbanEditModalProps) {
  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Configurar Etapas do Kanban"
    >
      {/* Adicionar Nova Etapa */}
      <ModalSection title="Adicionar Etapa">
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddColumn}
            className="flex items-center gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Nova Etapa
          </Button>
          <p className="text-sm text-gray-600">
            Clique para adicionar uma nova etapa ao seu Kanban
          </p>
        </div>
      </ModalSection>

      {/* Configurar Etapas Existentes */}
      <ModalSection title="Etapas Configuradas">
        <div className="space-y-4">
          {columns.map((column, index) => (
            <div key={column.id} className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="flex-shrink-0 mt-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                </div>

                {/* Conteúdo da Coluna */}
                <div className="flex-1 space-y-4">
                  {/* Nome da Etapa */}
                  <div>
                    <Label htmlFor={`column-name-${column.id}`}>Nome da Etapa</Label>
                    <Input
                      id={`column-name-${column.id}`}
                      value={column.name}
                      onChange={(e) => onUpdateColumn(column.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
                      placeholder="Digite o nome da etapa"
                    />
                  </div>

                  {/* Cor da Etapa */}
                  <div>
                    <Label htmlFor={`column-color-${column.id}`}>Cor da Etapa</Label>
                    <Select
                      value={column.color}
                      onValueChange={(value) => onUpdateColumn(column.id, 'color', value)}
                    >
                      <SelectTrigger className="w-full px-4 py-3 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#3B82F6">Azul</SelectItem>
                        <SelectItem value="#10B981">Verde</SelectItem>
                        <SelectItem value="#F59E0B">Amarelo</SelectItem>
                        <SelectItem value="#EF4444">Vermelho</SelectItem>
                        <SelectItem value="#8B5CF6">Roxo</SelectItem>
                        <SelectItem value="#F97316">Laranja</SelectItem>
                        <SelectItem value="#6B7280">Cinza</SelectItem>
                        <SelectItem value="#EC4899">Rosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status da Etapa */}
                  <div>
                    <Label htmlFor={`column-status-${column.id}`}>Status da Etapa</Label>
                    <Select
                      value={column.status}
                      onValueChange={(value) => onUpdateColumn(column.id, 'status', value)}
                    >
                      <SelectTrigger className="w-full px-4 py-3 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planejamento</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="on_hold">Em Espera</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contador de Projetos */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {projects.filter(project => {
                          if (column.status === 'planning') return project.status === 'planning';
                          if (column.status === 'active') return project.status === 'active';
                          if (column.status === 'on_hold') return project.status === 'on_hold';
                          if (column.status === 'completed') return project.status === 'completed';
                          return project.status === column.status;
                        }).length}
                      </span> projetos nesta etapa
                    </div>

                    {/* Botão Remover */}
                    {columns.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveColumn(column.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModalSection>

      {/* Preview das Etapas */}
      <ModalSection title="Preview das Etapas">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex gap-3 overflow-x-auto">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-48 p-3 rounded-lg border-2"
                style={{ 
                  borderColor: column.color,
                  backgroundColor: `${column.color}15`
                }}
              >
                <div className="text-sm font-medium mb-2" style={{ color: column.color }}>
                  {column.name}
                </div>
                <div className="text-xs text-gray-600">
                  {projects.filter(project => {
                    if (column.status === 'planning') return project.status === 'planning';
                    if (column.status === 'active') return project.status === 'active';
                    if (column.status === 'on_hold') return project.status === 'on_hold';
                    if (column.status === 'completed') return project.status === 'completed';
                    return project.status === column.status;
                  }).length} projetos
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalSection>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          className="px-6 py-3 border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200"
        >
          Fechar
        </Button>
        <Button
          onClick={onClose}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </RightDrawerModal>
  );
}

export default KanbanEditModal;
