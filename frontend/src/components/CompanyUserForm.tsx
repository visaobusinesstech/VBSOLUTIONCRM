import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loader2, User, Mail, Lock, Phone, Briefcase } from 'lucide-react';

interface CompanyUserFormProps {
  onUserCreated?: () => void;
}

interface Position {
  id: string;
  name: string;
}

export default function CompanyUserForm({ onUserCreated }: CompanyUserFormProps) {
  const { createCompanyUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    phone: ''
  });

  // Buscar cargos cadastrados na estrutura organizacional
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoadingPositions(true);
      
      // Buscar cargos (type = 'position') da estrutura organizacional
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('id, name')
        .eq('type', 'position')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar cargos:', error);
        return;
      }

      setPositions(data || []);
      console.log('✅ Cargos carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.position) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Criando usuário da empresa...');
    
    try {
      const result = await createCompanyUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        phone: formData.phone || undefined
      });

      if (result.error) {
        console.error('❌ Erro ao criar usuário:', result.error);
        alert('Erro ao criar usuário: ' + result.error.message);
        return;
      }

      console.log('✅ Usuário criado com sucesso:', result.data);
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        password: '',
        position: '',
        phone: ''
      });

      // Chamar callback se fornecido
      if (onUserCreated) {
        onUserCreated();
      }

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      alert('Erro inesperado ao criar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Cadastrar Usuário da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  placeholder="Nome completo do usuário"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha segura"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="position">Cargo *</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleInputChange('position', value)}
                disabled={loadingPositions}
              >
                <SelectTrigger id="position" className="w-full">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder={loadingPositions ? "Carregando cargos..." : "Selecione um cargo"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {positions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {loadingPositions ? "Carregando..." : "Nenhum cargo cadastrado"}
                    </SelectItem>
                  ) : (
                    positions.map((position) => (
                      <SelectItem key={position.id} value={position.name}>
                        {position.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {positions.length === 0 && !loadingPositions && (
                <p className="text-xs text-amber-600">
                  ⚠️ Nenhum cargo cadastrado. Por favor, cadastre cargos na seção "Estrutura" primeiro.
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Botão de Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando usuário...
                </>
              ) : (
                'Cadastrar Usuário'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
