import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Mail, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EmailHistory() {
  const { user } = useAuth();
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchHistorico();
      subscribeToRealtime();
    }
  }, [user]);

  const fetchHistorico = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('envios_historico')
        .select('*')
        .eq('user_id', user.id)
        .order('data_envio', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRealtime = () => {
    if (!user?.id) return;

    const channel = supabase
      .channel('envios_historico_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'envios_historico',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHistorico();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredHistorico = historico;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enviado
          </Badge>
        );
      case 'erro':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getTipoBadge = (tipo: string) => {
    const colors = {
      individual: 'bg-blue-100 text-blue-800',
      lote: 'bg-purple-100 text-purple-800',
      ultra_parallel_v6: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tipo}
      </Badge>
    );
  };

  const stats = {
    total: historico.length,
    enviados: historico.filter(h => h.status === 'enviado').length,
    erros: historico.filter(h => h.status === 'erro').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Indicador de tempo real */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Atualizações em tempo real ativadas</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium">Enviados</p>
                <p className="text-2xl font-bold text-green-600">{stats.enviados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.erros}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Remetente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistorico.map((envio) => (
                <TableRow key={envio.id}>
                  <TableCell>
                    {format(new Date(envio.data_envio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{envio.destinatario_nome}</div>
                      <div className="text-sm text-muted-foreground">{envio.destinatario_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{envio.remetente_nome}</div>
                      <div className="text-sm text-muted-foreground">{envio.remetente_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(envio.status)}</TableCell>
                  <TableCell>{getTipoBadge(envio.tipo_envio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistorico.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum envio realizado ainda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

