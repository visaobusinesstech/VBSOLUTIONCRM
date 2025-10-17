import React, { useState } from 'react';
import { RightDrawerModal, ModalSection } from '@/components/ui/right-drawer-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Phone, 
  Mail, 
  Building, 
  X,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id: string;
  owner_id: string;
  atendimento_id?: string;
  chat_id?: string;
  business_id?: string;
  name_wpp?: string;
  name: string;
  full_name?: string;
  phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionais que podem ser adicionados
  company?: string;
  gender?: string;
  status?: 'active' | 'inactive' | 'lead';
  pipeline?: string;
  tags?: string[];
  whatsapp_opted?: boolean;
  profile_image_url?: string;
  last_contact_at?: string;
}

interface RegisterContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contact: Contact) => void;
}

const RegisterContactModal: React.FC<RegisterContactModalProps> = ({
  isOpen,
  onClose,
  onContactCreated
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    gender: '',
    pipeline: '',
    whatsappOpted: true,
    consent: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.consent) {
      newErrors.consent = 'É necessário aceitar os termos de consentimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('➕ handleSubmit: Criando novo contato:', formData);
    
    if (!validateForm()) {
      console.log('❌ handleSubmit: Validação falhou');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactData = {
        owner_id: '905b926a-785a-4f6d-9c3a-9455729500b3', // ID do usuário logado
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: formData.email || null,
        company: formData.company || null,
        gender: formData.gender || null,
        status: 'active',
        pipeline: formData.pipeline || null,
        whatsapp_opted: formData.whatsappOpted,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_contact_at: new Date().toISOString()
      };

      console.log('➕ handleSubmit: Dados para inserção:', contactData);

      // Inserir no Supabase
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) {
        console.error('❌ handleSubmit: Erro no Supabase:', error);
        throw error;
      }

      console.log('✅ handleSubmit: Contato criado no Supabase:', data);

      const newContact: Contact = {
        ...data,
        tags: []
      };

      onContactCreated(newContact);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        company: '',
        gender: '',
        pipeline: '',
        whatsappOpted: true,
        consent: false
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar contato:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (formData.firstName && formData.phone) {
      // Redirecionar para WhatsApp com dados pré-preenchidos
      const contactData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone
      };
      
      // Salvar dados temporariamente e redirecionar
      localStorage.setItem('tempContact', JSON.stringify(contactData));
      window.location.href = '/whatsapp';
    }
  };

  return (
    <RightDrawerModal
      open={isOpen}
      onClose={onClose}
      title="Criar Novo Contato"
      actions={[
        {
          label: 'Cancelar',
          variant: 'outline',
          onClick: onClose
        },
        ...(formData.firstName && formData.phone ? [{
          label: 'Abrir Conversa',
          variant: 'outline' as const,
          onClick: handleOpenWhatsApp,
          icon: <MessageSquare className="w-4 h-4" />
        }] : []),
        {
          label: isSubmitting ? 'Criando...' : 'Criar',
          variant: 'primary' as const,
          onClick: handleSubmit,
          disabled: isSubmitting,
          icon: isSubmitting ? undefined : <CheckCircle className="w-4 h-4" />
        }
      ]}
      className="max-w-[600px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <ModalSection title="Informações Básicas">
            <div className="space-y-4">
              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    Nome *
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Digite o nome"
                      className={`pr-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Sobrenome
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Digite o sobrenome"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Número de Telefone *
                </Label>
                <div className="flex gap-2">
                  <Select defaultValue="+55">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+55">🇧🇷 +55</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+54">🇦🇷 +54</SelectItem>
                      <SelectItem value="+56">🇨🇱 +56</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 relative">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Inserir telefone"
                      className={`pr-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={formData.whatsappOpted}
                  onCheckedChange={(checked) => handleInputChange('whatsappOpted', checked as boolean)}
                />
                <Label htmlFor="whatsapp" className="text-sm text-gray-700">
                  Salve o número de telefone para utilizar em conversas no WhatsApp
                  <span className="text-blue-600 ml-1">?</span>
                </Label>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Digite o email"
                    className={`pr-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                  Empresa
                </Label>
                <div className="relative">
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Digite o nome da empresa"
                    className="pr-10"
                  />
                  <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Gênero */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                  Gênero
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar um gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pipeline */}
              <div className="space-y-2">
                <Label htmlFor="pipeline" className="text-sm font-semibold text-gray-700">
                  Pipeline
                </Label>
                <Select value={formData.pipeline} onValueChange={(value) => handleInputChange('pipeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Qualificação">Qualificação</SelectItem>
                    <SelectItem value="Proposta">Proposta</SelectItem>
                    <SelectItem value="Negociação">Negociação</SelectItem>
                    <SelectItem value="Fechamento">Fechamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ModalSection>

          {/* Consentimento */}
          <ModalSection>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange('consent', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                  Confirmo que obtivemos o consentimento adequado para enviar SMS, e-mail, ou outros tipos de mensagens de contatos sendo criados ou importados, em conformidade com as leis e regulamentos aplicáveis e com os{' '}
                  <span className="text-blue-600 underline cursor-pointer">Termos de Serviço</span>.
                </Label>
              </div>
              {errors.consent && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.consent}
                </p>
              )}
            </div>
          </ModalSection>
        </form>
    </RightDrawerModal>
  );
};

export default RegisterContactModal;
