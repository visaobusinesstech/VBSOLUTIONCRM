import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVB } from '@/contexts/VBContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ModernDashboard from '@/components/dashboard/ModernDashboard';

import { 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Star
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

const Dashboard = () => {
  const { state } = useVB();
  const { companies, employees, activities, settings, currentUser } = state;
  const { getProfile } = useAuth();
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState('');
  
  // Buscar o perfil do usuário do Supabase quando o componente montar
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { profile, error } = await getProfile();
        
        if (profile && profile.name) {
          // Extrair o primeiro nome
          const firstName = profile.name.split(' ')[0];
          setUserFirstName(firstName);
        } else if (error) {
          console.warn('⚠️ Dashboard: Erro ao buscar perfil:', error);
          // Fallback para o nome do currentUser se disponível
          if (currentUser?.name) {
            const firstName = currentUser.name.split(' ')[0];
            setUserFirstName(firstName);
          }
        }
      } catch (error) {
        console.error('❌ Dashboard: Erro ao buscar perfil do usuário:', error);
        // Fallback para o nome do currentUser se disponível
        if (currentUser?.name) {
          const firstName = currentUser.name.split(' ')[0];
          setUserFirstName(firstName);
        }
      }
    };

    fetchUserProfile();
  }, []); // Array vazio = executa apenas uma vez
  


  // Métricas calculadas
  const overdueActivities = activities.filter(a => new Date(a.date) < new Date() && a.status !== 'completed').length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const inProgressActivities = activities.filter(a => a.status === 'in-progress').length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;

  // Debug temporário para verificar atividades
  console.log('🔍 Dashboard - Atividades:', {
    total: activities.length,
    pending: pendingActivities,
    inProgress: inProgressActivities,
    completed: completedActivities,
    overdue: overdueActivities,
    statuses: activities.map(a => ({ id: a.id, title: a.title, status: a.status }))
  });

  // Dados para gráficos
  const companiesByStage = settings.funnelStages.map(stage => ({
    name: stage.name,
    value: companies.filter(c => c.funnelStage === stage.id).length,
    color: '#6b7280' // Cor neutra para todos
  }));

  // Dados para o gráfico de linha "Horas Totais"
  const totalHoursData = [
    { month: 'Jan', hours: 240 },
    { month: 'Feb', hours: 320 },
    { month: 'Mar', hours: 280 },
    { month: 'Apr', hours: 380 },
    { month: 'Mai', hours: 420 },
    { month: 'Jun', hours: 360 },
  ];

  // Ranking da equipe
  const teamRanking = [
    { name: 'Ana Silva', role: 'Desenvolvedora Senior', hours: 180, tasks: 24, efficiency: 95 },
    { name: 'Carlos Santos', role: 'Product Manager', hours: 165, tasks: 21, efficiency: 92 },
    { name: 'Maria Costa', role: 'Designer UX/UI', hours: 170, tasks: 18, efficiency: 88 },
    { name: 'João Oliveira', role: 'Desenvolvedor Full Stack', hours: 155, tasks: 15, efficiency: 85 },
    { name: 'Paula Lima', role: 'QA Engineer', hours: 140, tasks: 12, efficiency: 82 },
  ];

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Funcionário não encontrado';
  };

  // Função para obter saudação baseada na hora do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom Dia';
    if (hour < 18) return 'Boa Tarde';
    return 'Boa Noite';
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{getGreeting()}, {userFirstName || 'Usuário'}</h1>
            <p className="text-sm text-gray-600">Aqui está um resumo do seu negócio hoje</p>
          </div>
        </div>
      </div>

      {/* Blocos de Atividades */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Atividades Atrasadas */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Atrasadas</p>
                  <p className="text-3xl font-bold text-red-600">{overdueActivities}</p>
                  <p className="text-xs text-gray-500 mt-1">Necessitam atenção</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Pendentes */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingActivities}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando início</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Em Progresso */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Em Progresso</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressActivities}</p>
                  <p className="text-xs text-gray-500 mt-1">Em andamento</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Concluídas */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Concluídas</p>
                  <p className="text-3xl font-bold text-green-600">{completedActivities}</p>
                  <p className="text-xs text-gray-500 mt-1">Finalizadas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Moderno */}
      <ModernDashboard />
    </div>
  );
};

export default Dashboard;

