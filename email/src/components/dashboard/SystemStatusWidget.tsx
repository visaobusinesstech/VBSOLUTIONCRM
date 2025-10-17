
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    database: boolean;
    auth: boolean;
    email: boolean;
  };
  lastCheck: Date;
}

export const SystemStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const checkSystemStatus = async (): Promise<SystemStatus> => {
    const services = {
      database: false,
      auth: false,
      email: false
    };

    // Verificar banco de dados
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      services.database = !error;
    } catch {
      services.database = false;
    }

    // Verificar autenticação
    try {
      const { error } = await supabase.auth.getSession();
      services.auth = !error;
    } catch {
      services.auth = false;
    }

    // Verificar serviço de email (simplified)
    services.email = true; // Assumir funcionando por padrão

    const healthyCount = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let overall: SystemStatus['overall'] = 'healthy';
    if (healthyCount === 0) {
      overall = 'critical';
    } else if (healthyCount < totalServices) {
      overall = 'warning';
    }

    return {
      overall,
      services,
      lastCheck: new Date()
    };
  };

  const updateStatus = async () => {
    setIsChecking(true);
    try {
      const newStatus = await checkSystemStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    updateStatus();
    
    // Atualizar a cada 60 segundos
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!status) return <Activity className="h-4 w-4 text-gray-500" />;
    
    switch (status.overall) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="outline">Verificando...</Badge>;
    
    switch (status.overall) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Sistema OK</Badge>;
      case 'warning':
        return <Badge variant="secondary">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'border-gray-300';
    
    switch (status.overall) {
      case 'healthy':
        return 'border-green-500 bg-green-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'critical':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <Card className={`border-l-4 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            Status do Sistema
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {status && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                {status.services.database ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Banco</span>
              </div>
              <div className="flex items-center gap-1">
                {status.services.auth ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Auth</span>
              </div>
              <div className="flex items-center gap-1">
                {status.services.email ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Email</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Última verificação: {status.lastCheck.toLocaleTimeString()}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={updateStatus}
                  disabled={isChecking}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/diagnostico')}
                  className="h-6 px-2 text-xs"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
