import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Mail, CheckCircle, XCircle, AlertTriangle, TestTube, Upload, Image, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function EmailSettingsForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const signatureInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    smtp_host: '',
    email_porta: 587,
    email_usuario: '',
    smtp_pass: '',
    smtp_seguranca: 'tls',
    smtp_from_name: '',
    signature_image: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
      setFormData({
          smtp_host: data.smtp_host || '',
          email_porta: data.email_porta || 587,
          email_usuario: data.email_usuario || '',
          smtp_pass: data.smtp_pass || '',
          smtp_seguranca: data.smtp_seguranca || 'tls',
          smtp_from_name: data.smtp_from_name || '',
          signature_image: data.signature_image || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações de email');
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!formData.smtp_host || !formData.email_usuario || !formData.smtp_pass) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // Verificar se já existe configuração
      const { data: existing } = await supabase
        .from('configuracoes')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const configData = {
        user_id: user.id,
        smtp_host: formData.smtp_host,
        email_porta: formData.email_porta,
        email_usuario: formData.email_usuario,
        smtp_pass: formData.smtp_pass,
        smtp_seguranca: formData.smtp_seguranca,
        smtp_from_name: formData.smtp_from_name,
        signature_image: formData.signature_image,
        use_smtp: true,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        const result = await supabase
          .from('configuracoes')
          .update(configData)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('configuracoes')
          .insert([configData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success('Configurações de email salvas com sucesso!');
      setTestResult(null);
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!formData.smtp_host || !formData.email_usuario || !formData.smtp_pass) {
      toast.error('Preencha as configurações SMTP antes de testar');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      // Chamar a edge function de teste SMTP
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          smtp_host: formData.smtp_host,
          email_porta: formData.email_porta,
          email_usuario: formData.email_usuario,
          smtp_pass: formData.smtp_pass,
          smtp_seguranca: formData.smtp_seguranca,
          smtp_from_name: formData.smtp_from_name
        }
      });

      if (error) {
        setTestResult({
          success: false,
          message: 'Erro ao testar conexão: ' + error.message
        });
        toast.error('Falha no teste de conexão SMTP');
      } else if (data?.success) {
        setTestResult({
          success: true,
          message: 'Conexão SMTP testada com sucesso!'
        });
        toast.success('Conexão SMTP funcionando corretamente!');
      } else {
        setTestResult({
          success: false,
          message: data?.message || 'Erro desconhecido'
        });
        toast.error('Falha no teste de conexão SMTP');
      }
    } catch (error: any) {
      console.error('Erro ao testar SMTP:', error);
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão: ' + error.message
      });
      toast.error('Erro ao testar conexão SMTP');
    } finally {
      setTesting(false);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!imageTypes.includes(file.type)) {
      toast.error('Assinatura deve ser uma imagem (PNG, JPEG, JPG)');
      return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo permitido: 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          signature_image: content
        }));
        toast.success('Assinatura adicionada com sucesso!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast.error('Erro ao processar assinatura');
    }
  };

  const removeSignature = () => {
    setFormData(prev => ({
      ...prev,
      signature_image: ''
    }));
    toast.success('Assinatura removida');
  };

  const hasSettings = formData.smtp_host && formData.email_usuario && formData.smtp_pass;

  return (
    <Card>
        <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de Email SMTP
            </CardTitle>
          <CardDescription>
              Configure seu servidor SMTP para envio de emails personalizados
          </CardDescription>
          </div>
          {hasSettings && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          )}
        </div>
        </CardHeader>

        <CardContent className="space-y-6">
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
            <Label htmlFor="smtp_host">Servidor SMTP *</Label>
                <Input
                  id="smtp_host"
              placeholder="smtp.gmail.com"
              value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                />
            <p className="text-xs text-muted-foreground">
              Exemplos: smtp.gmail.com, smtp-mail.outlook.com, smtp.mail.yahoo.com
            </p>
              </div>
              
              <div className="space-y-2">
            <Label htmlFor="email_porta">Porta *</Label>
            <Select
              value={formData.email_porta.toString()}
              onValueChange={(value) => setFormData({ ...formData, email_porta: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="587">587 (TLS - Recomendado)</SelectItem>
                <SelectItem value="465">465 (SSL)</SelectItem>
                <SelectItem value="25">25 (Sem criptografia)</SelectItem>
              </SelectContent>
            </Select>
              </div>
            </div>

            <div className="space-y-2">
          <Label htmlFor="smtp_from_name">Nome do Remetente *</Label>
              <Input
                id="smtp_from_name"
            placeholder="Sua Empresa"
            value={formData.smtp_from_name}
                onChange={(e) => setFormData({ ...formData, smtp_from_name: e.target.value })}
              />
          <p className="text-xs text-muted-foreground">
            Nome que aparecerá como remetente dos emails
          </p>
            </div>

            <div className="space-y-2">
          <Label htmlFor="email_usuario">Email/Usuário *</Label>
              <Input
            id="email_usuario"
            type="email"
            placeholder="seu@email.com"
            value={formData.email_usuario}
                onChange={(e) => setFormData({ ...formData, email_usuario: e.target.value })}
              />
            </div>

            <div className="space-y-2">
          <Label htmlFor="smtp_pass">Senha/Token *</Label>
              <Input
                id="smtp_pass"
                type="password"
                placeholder="Sua senha ou token de aplicativo"
            value={formData.smtp_pass}
                onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
              />
          <p className="text-xs text-muted-foreground">
            Para Gmail, use uma senha de aplicativo. Para Outlook, use sua senha normal.
          </p>
            </div>

            <div className="space-y-2">
          <Label htmlFor="smtp_seguranca">Segurança *</Label>
              <Select
            value={formData.smtp_seguranca}
                onValueChange={(value) => setFormData({ ...formData, smtp_seguranca: value })}
              >
                <SelectTrigger>
              <SelectValue />
                </SelectTrigger>
                <SelectContent>
              <SelectItem value="tls">TLS (Recomendado para porta 587)</SelectItem>
              <SelectItem value="ssl">SSL (Para porta 465)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo de Assinatura Global */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="text-base font-semibold">Assinatura Digital Global</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta assinatura será automaticamente adicionada a todos os templates de email
                </p>
              </div>

              {formData.signature_image ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Assinatura Atual:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeSignature}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                    <img
                      src={formData.signature_image}
                      alt="Assinatura digital"
                      className="max-w-full h-32 object-contain border rounded bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma assinatura configurada
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione uma assinatura digital que será usada em todos os templates
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Assinatura
                  </Button>
                </div>
              )}

              <input
                ref={signatureInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleSignatureUpload}
                className="hidden"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Formato recomendado
                    </h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Formatos aceitos: PNG, JPEG, JPG</li>
                        <li>Tamanho máximo: 5MB</li>
                        <li>Dimensões recomendadas: 200-400px de largura</li>
                        <li>Fundo transparente para melhor integração</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          <Alert>
          <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
            <strong>Importante:</strong> As credenciais SMTP são sensíveis. Certifique-se de usar senhas de aplicativo quando disponível (Gmail) e nunca compartilhe essas informações.
            </AlertDescription>
          </Alert>
        </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testing || loading || !hasSettings}
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>

        <Button onClick={handleSave} disabled={loading || testing}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
            <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
          </Button>
        </CardFooter>
    </Card>
  );
}
