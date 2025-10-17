import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Building, User, Phone, Briefcase, Users, Target, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterData {
  // Etapa 1
  name: string;
  companyName: string;
  companyPhone: string;
  
  // Etapa 2
  position: string;
  employeesCount: string;
  
  // Etapa 3
  businessNiche: string;
  targetAudience: string;
  
  // Etapa 4
  email: string;
  password: string;
}

const positions = [
  'CEO / Diretor',
  'Coordenador / Gerente de TI',
  'Gerente de Vendas',
  'Analista de Negócios',
  'Assistente Administrativo',
  'Outros'
];

const employeesOptions = [
  'Não tenho',
  '1-3',
  '4-10',
  '11-20',
  '21-50',
  '51+'
];

const businessNiches = [
  'Tecnologia',
  'Varejo',
  'Serviços',
  'Indústria',
  'Saúde',
  'Educação',
  'Financeiro',
  'Outros'
];

const targetAudiences = [
  'Empresas',
  'Pessoas Físicas',
  'Instituições',
  'Órgãos Públicos'
];

export default function Register() {
  const navigate = useNavigate();
  const { signUpCompany } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    companyName: '',
    companyPhone: '',
    position: '',
    employeesCount: '',
    businessNiche: '',
    targetAudience: '',
    email: '',
    password: ''
  });

  // Funções de validação
  const validatePhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos';
    }
    
    // Verifica se começa com DDD válido (11-99)
    const ddd = cleanPhone.substring(0, 2);
    if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
      return 'DDD inválido';
    }
    
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido';
    }
    return '';
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no tamanho
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    } else {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    let processedValue = value;
    
    // Aplicar formatação para telefone
    if (field === 'companyPhone') {
      processedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const nextStep = () => {
    const stepErrors = calculateCurrentStepErrors();
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0 && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({}); // Limpa os erros ao voltar
    }
  };

  const handleSubmit = async () => {
    const stepErrors = calculateCurrentStepErrors();
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length > 0) {
      console.log('❌ Erros de validação encontrados:', stepErrors);
      return; // Não submete se houver erros
    }

    setIsLoading(true);
    console.log('🚀 INICIANDO PROCESSO DE REGISTRO...');
    console.log('📋 Dados do formulário:', formData);
    
    try {
      const result = await signUpCompany(formData);
      
      if (result.error) {
        console.error('❌ ERRO NO REGISTRO:', result.error);
        alert('Erro no registro: ' + result.error.message);
        return;
      }
      
      console.log('✅ REGISTRO REALIZADO COM SUCESSO!');
      console.log('📊 Dados salvos:', result.data);
      console.log('🏢 Owner ID:', result.data?.ownerId);
      console.log('👤 Usuário criado:', result.data?.user?.id);
      console.log('📧 Email de verificação enviado para:', formData.email);
      
      // Redirecionar para a Home após 1 segundo
      setTimeout(() => {
        console.log('🔄 Redirecionando para Home...');
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('❌ ERRO INESPERADO NO REGISTRO:', error);
      alert('Erro inesperado: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para calcular os erros da etapa atual (não altera o estado)
  const calculateCurrentStepErrors = () => {
    const newErrors: {[key: string]: string} = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório';
        
        const phoneError = validatePhone(formData.companyPhone);
        if (phoneError) newErrors.companyPhone = phoneError;
        break;
        
      case 2:
        if (!formData.position) newErrors.position = 'Cargo é obrigatório';
        if (!formData.employeesCount) newErrors.employeesCount = 'Quantidade de funcionários é obrigatória';
        break;
        
      case 3:
        if (!formData.businessNiche) newErrors.businessNiche = 'Nicho da empresa é obrigatório';
        if (!formData.targetAudience) newErrors.targetAudience = 'Público-alvo é obrigatório';
        break;
        
      case 4:
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;
        if (!formData.password || formData.password.length < 6) {
          newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }
        break;
        
      default:
        break;
    }
    return newErrors;
  };

  // Função para verificar se a etapa atual é válida (usada no disabled do botão)
  const isCurrentStepValid = () => {
    const stepErrors = calculateCurrentStepErrors();
    return Object.keys(stepErrors).length === 0;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            {/* Nome */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o seu nome?</h3>
                    <Label className="text-xs text-gray-600">Nome completo</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Input
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </CardContent>
            </Card>

            {/* Nome da Empresa */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o nome da sua empresa?</h3>
                    <Label className="text-xs text-gray-600">Empresa</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Input
                  placeholder="Nome da Empresa"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </CardContent>
            </Card>

            {/* Telefone da Empresa */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Em qual telefone podemos entrar em contato?</h3>
                    <Label className="text-xs text-gray-600">Nº Celular / WhatsApp</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  className={`border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    errors.companyPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.companyPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyPhone}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            {/* Cargo */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o seu cargo?</h3>
                    <Label className="text-xs text-gray-600">Cargo</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-2 gap-1">
                  {positions.map((position) => (
                    <Button
                      key={position}
                      variant={formData.position === position ? "default" : "outline"}
                      size="sm"
                      className={`justify-start text-xs ${
                        formData.position === position 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'border-gray-200 text-gray-700 hover:bg-blue-50'
                      }`}
                      onClick={() => handleInputChange('position', position)}
                    >
                      {position}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantidade de Funcionários */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o tamanho da sua equipe comercial?</h3>
                    <Label className="text-xs text-gray-600">Funcionários</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="flex flex-wrap gap-1">
                  {employeesOptions.map((option) => (
                    <Button
                      key={option}
                      variant={formData.employeesCount === option ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${
                        formData.employeesCount === option 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'border-gray-200 text-gray-700 hover:bg-blue-50'
                      }`}
                      onClick={() => handleInputChange('employeesCount', option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            {/* Nicho da Empresa */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o nicho da sua empresa?</h3>
                    <Label className="text-xs text-gray-600">Setor de atuação</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-2 gap-1">
                  {businessNiches.map((niche) => (
                    <Button
                      key={niche}
                      variant={formData.businessNiche === niche ? "default" : "outline"}
                      size="sm"
                      className={`justify-start text-xs ${
                        formData.businessNiche === niche 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'border-gray-200 text-gray-700 hover:bg-blue-50'
                      }`}
                      onClick={() => handleInputChange('businessNiche', niche)}
                    >
                      {niche}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Para quem vende */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Para quem você vende seu produto?</h3>
                    <Label className="text-xs text-gray-600">Público-alvo</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-2 gap-1">
                  {targetAudiences.map((audience) => (
                    <Button
                      key={audience}
                      variant={formData.targetAudience === audience ? "default" : "outline"}
                      size="sm"
                      className={`justify-start text-xs ${
                        formData.targetAudience === audience 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'border-gray-200 text-gray-700 hover:bg-blue-50'
                      }`}
                      onClick={() => handleInputChange('targetAudience', audience)}
                    >
                      {audience}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            {/* Email */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Qual o seu email?</h3>
                    <Label className="text-xs text-gray-600">Endereço de email</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </CardContent>
            </Card>

            {/* Senha */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Crie uma senha segura</h3>
                    <Label className="text-xs text-gray-600">Senha</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Confirme seu email
                </h2>
                <p className="text-gray-600">
                  Enviamos um link de confirmação para:
                </p>
                <p className="text-blue-600 font-semibold">
                  {formData.email}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Próximos passos:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                  <li>1. Verifique sua caixa de entrada</li>
                  <li>2. Clique no link de confirmação</li>
                  <li>3. Você será redirecionado para a página de login</li>
                  <li>4. Faça login com seu email e senha</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    console.log('🔄 Redirecionando para login...');
                    window.location.href = '/login';
                  }}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white"
                >
                  Ir para Login
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('🔄 Redirecionando para home...');
                    window.location.href = '/';
                  }}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Ir para Home
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://i.imgur.com/KdKLVUV.png"
              alt="VB Logo"
              className="h-12 w-12 object-contain filter brightness-0"
            />
          </div>
          
          {/* Barra de Progresso */}
          <div className="flex-1 max-w-xs mx-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-900 h-2 rounded-full transition-all duration-300"
                style={{ width: currentStep === 5 ? '100%' : `${(currentStep / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {currentStep === 5 ? 'Concluído' : `Etapa ${currentStep} de 4`}
            </p>
          </div>

          <a href="/login" className="text-blue-900 hover:underline">
            Sair
          </a>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto relative">
        <div className="w-full max-w-xl">
          {renderStep()}
        </div>

        {/* Botões de Navegação - Afastados do Conteúdo */}
        {currentStep !== 5 && (
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-16">
            {/* Botão Voltar - Esquerda */}
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto ${
                currentStep === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-900 hover:bg-blue-950 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Botão Avançar/Finalizar - Direita */}
            <button
              onClick={currentStep === 4 ? handleSubmit : nextStep}
              disabled={!isCurrentStepValid() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto ${
                !isCurrentStepValid() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-900 hover:bg-blue-950 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
