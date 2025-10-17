import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Erro na autorização: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Código de autorização não fornecido');
        return;
      }

      try {
        // Enviar código para o backend
        const response = await fetch('http://localhost:3000/api/integrations/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Google conectado com sucesso!');
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate('/settings?google_connected=true');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao conectar com Google');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage('Erro de conexão com o servidor');
        console.error('Erro no callback:', err);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              Conectando com Google...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto processamos sua autorização
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              Conectado com Sucesso!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecionando para as configurações...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              Erro na Conexão
            </h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar às Configurações
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
}
