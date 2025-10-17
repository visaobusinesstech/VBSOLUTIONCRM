import React from 'react';
import { 
  RightDrawerModal,
  ModalSection
} from '@/components/ui/right-drawer-modal';
import { Save, X } from 'lucide-react';

interface StandardizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  disclaimerText?: string;
}

export function StandardizedModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  isSubmitting = false,
  children,
  disclaimerText = "Preencha todos os campos obrigatórios para garantir o salvamento correto."
}: StandardizedModalProps) {
  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title={title}
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          icon: <X className="h-4 w-4" />
        },
        {
          label: "Salvar",
          variant: "primary",
          onClick: onSubmit,
          disabled: isSubmitting,
          icon: <Save className="h-4 w-4" />
        }
      ]}
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
                {disclaimerText}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ModalSection>
          {children}
        </ModalSection>
      </form>
    </RightDrawerModal>
  );
}
