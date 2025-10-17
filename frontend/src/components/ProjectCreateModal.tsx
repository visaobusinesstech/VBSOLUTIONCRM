
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RightDrawerModal,
  ModalSection
} from '@/components/ui/right-drawer-modal';
import { 
  Save,
  X,
  ListTodo
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Project } from '@/hooks/useProjects';
import { ProjectActivitiesModal } from './ProjectActivitiesModal';

interface ProjectData {
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  budget?: number;
  company_id?: string;
  tags?: string[];
  notes?: string;
  currency?: string;
  progress?: number;
}

interface ProjectCreateModalProps {
  isOpen?: boolean;
  onSubmit: (projectData: ProjectData) => Promise<any>;
  onClose: () => void;
  companies?: any[];
  employees?: any[];
}

const ProjectCreateModal = ({ isOpen = true, onSubmit, onClose, companies = [], employees = [] }: ProjectCreateModalProps) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    due_date: '',
    budget: undefined,
    company_id: '',
    tags: [],
    notes: '',
    currency: 'BRL',
    progress: 0
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);


  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar projetos",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Campo obrigatório", 
        description: "Descrição do projeto é obrigatória",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados do projeto com todos os campos necessários
      const projectData = {
        ...formData,
        progress: formData.progress || 0,
        currency: formData.currency || 'BRL'
      };

      console.log('ProjectCreateModal - Dados do projeto:', projectData);

      // SALVAR NO SUPABASE usando a prop onSubmit
      const savedProject = await onSubmit(projectData);
      
      console.log('Projeto criado:', savedProject);
      
      // Salvar o projeto criado para usar no modal de atividades
      setCreatedProject(savedProject);
      
      toast({
        title: "Projeto criado com sucesso!",
        description: "O projeto foi salvo. Deseja gerenciar as atividades agora?",
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setIsActivitiesModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Gerenciar Atividades
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Limpar formulário
                setFormData({
                  name: '',
                  description: '',
                  status: 'planning',
                  priority: 'medium',
                  start_date: '',
                  due_date: '',
                  budget: undefined,
                  company_id: '',
                  tags: [],
                  notes: '',
                  currency: 'BRL',
                  progress: 0
                });
                setCreatedProject(null);
                onClose();
              }}
            >
              Fechar
            </Button>
          </div>
        )
      });

    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro ao criar projeto",
        description: error?.message || "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Criar Projeto"
      actions={[
        {
          label: "Cancelar",
          variant: "outline" as const,
          onClick: onClose,
          icon: <X className="h-4 w-4" />
        },
        {
          label: isSubmitting ? "Criando..." : "Criar Projeto",
          variant: "primary" as const,
          onClick: handleSubmit,
          disabled: isSubmitting,
          icon: <Save className="h-4 w-4" />
        }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
                Preencha todos os campos obrigatórios para garantir o salvamento correto do projeto.
              </p>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <ModalSection>
          <div className="space-y-4">
            {/* Nome do Projeto */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-800">
                Nome do Projeto *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do projeto"
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-800">
                Descrição *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto"
                rows={4}
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200 resize-none"
                required
              />
            </div>
          </div>
        </ModalSection>

        {/* Status e Prioridade */}
        <ModalSection title="Status e Prioridade">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-800">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger className="w-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planejamento</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="on_hold">Em Pausa</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-800">
                Prioridade
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                <SelectTrigger className="w-full px-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ModalSection>

        {/* Datas */}
        <ModalSection title="Datas do Projeto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-semibold text-gray-800">
                Data de Início
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-semibold text-gray-800">
                Data de Vencimento
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
              />
            </div>
          </div>
        </ModalSection>

        {/* Orçamento */}
        <ModalSection title="Orçamento">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-semibold text-gray-800">
              Orçamento (R$)
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget || ''}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0.00"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
            />
          </div>
        </ModalSection>

        {/* Tags */}
        <ModalSection title="Tags">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma tag e pressione Enter"
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" className="px-4 py-3 border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200">
                Adicionar
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </ModalSection>

        {/* Notas */}
        <ModalSection title="Notas">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-800">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione notas sobre o projeto"
              rows={4}
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200 resize-none"
            />
          </div>
        </ModalSection>
      </form>

      {/* Modal de Atividades do Projeto */}
      {createdProject && (
        <ProjectActivitiesModal
          isOpen={isActivitiesModalOpen}
          onClose={() => {
            setIsActivitiesModalOpen(false);
            // Limpar formulário e fechar modal principal
            setFormData({
              name: '',
              description: '',
              status: 'planning',
              priority: 'medium',
              start_date: '',
              due_date: '',
              budget: undefined,
              company_id: '',
              tags: [],
              notes: '',
              currency: 'BRL',
              progress: 0
            });
            setCreatedProject(null);
            onClose();
          }}
          project={createdProject}
          employees={employees}
          companies={companies}
        />
      )}
    </RightDrawerModal>
  );
};

export default ProjectCreateModal;

