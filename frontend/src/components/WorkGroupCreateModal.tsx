import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  RightDrawerModal,
  ModalSection
} from '@/components/ui/right-drawer-modal';
import { 
  Save,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkGroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workGroupData: any) => void;
}

const WorkGroupCreateModal = ({ isOpen, onClose, onSubmit }: WorkGroupCreateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 [MODAL] handleSubmit chamado');
    console.log('📝 [MODAL] formData:', formData);
    
    // Validação básica
    if (!formData.name.trim()) {
      console.log('❌ [MODAL] Nome vazio, cancelando');
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ [MODAL] Validação passou, chamando onSubmit');
    onSubmit(formData);
    
    // Reset form
    setFormData({
      name: '',
      description: ''
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Criar Grupo de Trabalho"
      id="ID #NEW"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          icon: <X className="h-4 w-4" />
        },
        {
          label: "Criar Grupo",
          variant: "primary",
          onClick: handleSubmit,
          icon: <Save className="h-4 w-4" />
        }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalSection title="Informações Básicas">
          <div className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-600 mb-2 block">
                Nome do Grupo*
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome do grupo"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-600 mb-2 block">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o propósito do grupo"
                rows={3}
              />
            </div>
          </div>
        </ModalSection>

      </form>
    </RightDrawerModal>
  );
};

export default WorkGroupCreateModal;