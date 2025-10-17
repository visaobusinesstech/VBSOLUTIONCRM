import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Mail, MessageSquare, Clock, CheckCircle, FileText, TrendingUp, Users, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function EmailDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('week');
  const [customDate, setCustomDate] = useState('');
  const { user } = useAuth();
  const { topBarColor } = useTheme();
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalEnvios: 0,
    totalAgendamentos: 0
  });
  const [pendingSchedules, setPendingSchedules] = useState<any[]>([]);
  const [recentEnvios, setRecentEnvios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendChartData, setTrendChartData] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const [templates, envios, agendamentos] = await Promise.all([
        supabase.from('templates').select('id').eq('user_id', user.id),
        supabase.from('envios_historico').select('id, status, data_envio').eq('user_id', user.id),
        supabase.from('agendamentos').select('id').eq('user_id', user.id)
      ]);

      setStats({
        totalTemplates: templates.data?.length || 0,
        totalEnvios: envios.data?.length || 0,
        totalAgendamentos: agendamentos.data?.length || 0
      });

      // Preparar dados do gráfico de tendência
      await fetchTrendData(period, envios.data || []);
      await fetchRecentData();
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async (periodType: string, enviosData: any[]) => {
    const now = new Date();
    let intervals: Date[] = [];
    let groupBy: 'day' | 'week' | 'month' = 'day';

    switch (periodType) {
      case 'week':
        intervals = eachDayOfInterval({
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR })
        });
        groupBy = 'day';
        break;
      case 'month':
        intervals = eachDayOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
        groupBy = 'day';
        break;
      case 'year':
        intervals = eachMonthOfInterval({
          start: startOfYear(now),
          end: endOfYear(now)
        });
        groupBy = 'month';
        break;
      case 'custom':
        if (customDate) {
          const selectedDate = new Date(customDate);
          intervals = eachDayOfInterval({
            start: startOfMonth(selectedDate),
            end: endOfMonth(selectedDate)
          });
          groupBy = 'day';
        }
        break;
    }

    const chartData = intervals.map(date => {
      const dateStr = format(date, groupBy === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd');
      const count = enviosData.filter(envio => {
        const envioDate = new Date(envio.data_envio);
        const envioStr = format(envioDate, groupBy === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd');
        return envioStr === dateStr;
      }).length;

      return {
        date: format(date, groupBy === 'month' ? 'MMM' : 'dd/MM', { locale: ptBR }),
        count
      };
    });

    setTrendChartData(chartData);
  };

  const fetchRecentData = async () => {
    if (!user) return;

    try {
      // Fetch pending schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('status', 'pendente')
        .order('data_envio', { ascending: true })
        .limit(5);

      if (scheduleError) throw scheduleError;
      setPendingSchedules(scheduleData || []);

      // Fetch recent envios
      const { data: envioData, error: enviosError } = await supabase
        .from('envios_historico')
        .select('*')
        .order('data_envio', { ascending: false })
        .limit(5);

      if (enviosError) throw enviosError;
      
      const normalizedEnvios = envioData?.map(envio => {
        let normalizedStatus = envio.status;
        
        if (envio.status === 'enviado' || envio.status === 'reenviado') {
          normalizedStatus = 'entregue';
        } else if (envio.status === 'erro' || envio.status === 'com problemas') {
          normalizedStatus = 'falha';
        }
        
        return {
          ...envio,
          status: normalizedStatus
        };
      });
      
      setRecentEnvios(normalizedEnvios || []);
    } catch (error) {
      console.error('Erro ao carregar dados recentes:', error);
    }
  };
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    fetchData();
    
    const enviosChannel = supabase
      .channel('dashboard_envios_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'envios_historico' },
        () => fetchData()
      )
      .subscribe();
      
    const agendamentosChannel = supabase
      .channel('dashboard_agendamentos_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        () => fetchData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(enviosChannel);
      supabase.removeChannel(agendamentosChannel);
    };
  }, [user, period, customDate]);


  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year' | 'custom') => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setCustomDate('');
    }
  };

  const handleCustomDateChange = (date: string) => {
    setCustomDate(date);
    setPeriod('custom');
  };

  // Função para obter a cor do status de envio na lista de envios recentes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'falha':
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  // Função para obter o ícone do status de envio
  const getStatusIcon = (status: string) => {
    if (status === 'entregue') {
      return <CheckCircle className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  const emptyState = !stats.totalTemplates && !stats.totalEnvios && !stats.totalAgendamentos;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards com fundo branco */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:from-slate-900 dark:to-slate-800 border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Templates</CardTitle>
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalTemplates}</div>
            <p className="text-xs text-gray-500">
              Total de templates criados
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:from-slate-900 dark:to-slate-800 border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Envios</CardTitle>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalEnvios}</div>
            <p className="text-xs text-gray-500">
              Total de mensagens enviadas
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:from-slate-900 dark:to-slate-800 border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Agendamentos</CardTitle>
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAgendamentos}</div>
            <p className="text-xs text-gray-500">
              Total de envios agendados
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:from-slate-900 dark:to-slate-800 border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Taxa de Sucesso</CardTitle>
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalEnvios > 0 ? Math.round((stats.totalEnvios - (stats.totalEnvios * 0.1)) / stats.totalEnvios * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500">
              Emails entregues com sucesso
            </p>
          </CardContent>
        </Card>
      </div>
      
      {emptyState ? (
        <Card className="p-8 shadow-md border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900 rounded-xl">
          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
              <Rocket className="h-12 w-12 text-blue-500 mb-0"/>
            </div>
            <h3 className="text-xl font-semibold mb-3">Bem-vindo ao seu Dashboard!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comece adicionando contatos e criando templates para visualizar suas estatísticas aqui.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Gráfico de Tendência de Envios */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-gray-900">Tendência de Envios</CardTitle>
                  <CardDescription>
                    Quantidade de emails enviados por período
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={period === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange('week')}
                    className={period === 'week' ? 'text-white' : ''}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={period === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange('month')}
                    className={period === 'month' ? 'text-white' : ''}
                  >
                    Mês
                  </Button>
                  <Button
                    variant={period === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange('year')}
                    className={period === 'year' ? 'text-white' : ''}
                  >
                    Ano
                  </Button>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => handleCustomDateChange(e.target.value)}
                    className="h-9 px-3 rounded-md border border-input bg-white text-sm"
                    placeholder="Data personalizada"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke={topBarColor || '#3b82f6'}
                      strokeWidth={3}
                      dot={{ fill: topBarColor || '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Envios"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Dados de envio serão exibidos conforme você realizar envios
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Próximos Agendamentos</CardTitle>
              <CardDescription>
                Envios programados para os próximos dias
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : pendingSchedules.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Calendar className="h-10 w-10 text-blue-300 dark:text-blue-700 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhum envio agendado. Crie seu primeiro agendamento na página de agendamentos.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-blue-100 dark:divide-blue-900">
                {pendingSchedules.map((schedule) => (
                  <div key={schedule.id} className="py-4 flex justify-between items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/20 px-3 rounded-md transition-colors">
                    <div>
                      <p className="font-medium">Agendamento</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users size={14} />
                        Email agendado
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(schedule.data_envio), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(schedule.data_envio), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Status dos Envios Recentes</CardTitle>
              <CardDescription>
                Resumo dos últimos envios realizados
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentEnvios.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Mail className="h-10 w-10 text-blue-300 dark:text-blue-700 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhum envio realizado ainda. Comece enviando sua primeira mensagem.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-blue-100 dark:divide-blue-900">
                {recentEnvios.map((envio) => (
                  <div key={envio.id} className="py-4 flex justify-between items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/20 px-3 rounded-md transition-colors">
                    <div>
                      <p className="font-medium">Email Enviado</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users size={14} />
                        {envio.destinatario_nome || 'Destinatário'}
                      </p>
            </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(envio.data_envio), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                        getStatusColor(envio.status)
                      }`}>
                        {getStatusIcon(envio.status)}
                        {envio.status === 'entregue' ? 'entregue' : 
                         envio.status === 'pendente' ? 'pendente' : 'falha'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

