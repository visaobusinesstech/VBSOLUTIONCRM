
import { useState, useEffect } from 'react';
import { RightDrawerModal, ModalSection } from '@/components/ui/right-drawer-modal';
import { Button } from '@/components/ui/button';
import { Company } from '@/hooks/useCompanies';
import ImprovedCompanyForm from './ImprovedCompanyForm';
import { Save, X } from 'lucide-react';

interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUpdate: (id: string, data: any) => Promise<void>;
}

export function CompanyEditModal({ isOpen, onClose, company, onUpdate }: CompanyEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!company) return;
    
    try {
      setIsSubmitting(true);
      await onUpdate(company.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Editar Empresa"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          icon: <X className="h-4 w-4" />
        },
        {
          label: "Salvar Alterações",
          variant: "primary",
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
                Preencha todos os campos obrigatórios para garantir o salvamento correto da empresa.
              </p>
            </div>
          </div>
        </div>

        <ModalSection>
          <ImprovedCompanyForm 
            onSubmit={handleSubmit}
            initialData={company}
            isSubmitting={isSubmitting}
          />
        </ModalSection>
      </form>
    </RightDrawerModal>
  );
}
