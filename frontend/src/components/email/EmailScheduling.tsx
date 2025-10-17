import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarIcon, Clock, Trash2, Edit, Search, Users, Building2, Mail, CheckCircle, Send, Zap, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { useSchedules } from '@/hooks/useSchedules';
import { useBatchEmailSending } from '@/hooks/useBatchEmailSending';
import { useTemplateVariables } from '@/hooks/useTemplateVariables';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmailSchedulingProps {
  isCreating: boolean;
  onCreatingChange: (creating: boolean) => void;
}

export function EmailScheduling({ isCreating, onCreatingChange }: EmailSchedulingProps) {
  const { user } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const { schedules, loading: schedulesLoading, fetchSchedules } = useSchedules();
  const { sendBatchEmails, isProcessing, progress } = useBatchEmailSending();
  const { processTemplateVariables, getAvailableVariables } = useTemplateVariables();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contatoTipo, setContatoTipo] = useState<'contact' | 'company'>('contact');
  const [sendingNow, setSendingNow] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  
  const [formData, setFormData] = useState({
    template_id: '',
    data_envio: '',
    hora_envio: '',
    custom_subject: '',
    custom_content: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
      fetchSchedules();
    }
  }, [user, fetchSchedules]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [templatesRes, contactsRes, companiesRes] = await Promise.all([
        supabase
          .from('templates')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'ativo'),
        supabase
          .from('contacts')
          .select('id, name, email')
          .eq('owner_id', user.id),
        supabase
          .from('companies')
          .select('id, fantasy_name, email')
          .eq('owner_id', user.id)
      ]);

      // Verificar erros nas consultas
      if (templatesRes.error) {
        console.error('Erro ao buscar templates:', templatesRes.error);
        toast.error('Erro ao carregar templates');
      }
      if (contactsRes.error) {
        console.error('Erro ao buscar contatos:', contactsRes.error);
        toast.error('Erro ao carregar contatos');
      }
      if (companiesRes.error) {
        console.error('Erro ao buscar empresas:', companiesRes.error);
        toast.error('Erro ao carregar empresas');
      }

      setTemplates(templatesRes.data || []);
      setContacts(contactsRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgendamento = async () => {
    if (!user?.id) return;
    if (!formData.template_id || selectedContacts.length === 0 || !formData.data_envio || !formData.hora_envio) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const dataHora = `${formData.data_envio}T${formData.hora_envio}:00`;
      
      // Criar agendamento para cada contato selecionado usando o hook
      const { createSchedule } = useSchedules();
      
      let successCount = 0;
      for (const contatoId of selectedContacts) {
        const success = await createSchedule({
          contato_id: contatoId,
          template_id: formData.template_id,
          data_envio: dataHora,
          contato_tipo: contatoTipo
        });
        
        if (success) successCount++;
      }

      if (successCount > 0) {
        toast.success(`${successCount} agendamento(s) criado(s) com sucesso!`);
        setFormData({
          template_id: '',
          data_envio: '',
          hora_envio: '',
          custom_subject: '',
          custom_content: ''
        });
        setSelectedContacts([]);
        onCreatingChange(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  const handleDeleteAgendamento = async (id: string) => {
    try {
      const { deleteSchedule } = useSchedules();
      await deleteSchedule(id);
      fetchSchedules();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  // Função de validação de email
  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Função de envio imediato CORRIGIDA baseada no Rocktmail
  const handleSendNow = async () => {
    if (!formData.template_id) {
      toast.error("Selecione um template para enviar agora");
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast.error("Selecione pelo menos um destinatário para enviar agora");
      return;
    }

    // Validar emails dos contatos selecionados
    const currentList = contatoTipo === 'contact' ? contacts : companies;
    const contactsWithValidEmails = selectedContacts.filter(contactId => {
      const contact = currentList.find(c => c.id === contactId);
      const email = contact?.email || '';
      return contact && email && isValidEmail(email);
    });

    if (contactsWithValidEmails.length === 0) {
      toast.error("Nenhum destinatário selecionado possui email válido");
      return;
    }

    if (contactsWithValidEmails.length !== selectedContacts.length) {
      const invalidCount = selectedContacts.length - contactsWithValidEmails.length;
      toast.warning(`${invalidCount} destinatários com emails inválidos serão ignorados`);
    }

    // Confirmação para volumes grandes
    if (contactsWithValidEmails.length >= 100) {
      const proceed = window.confirm(
        `Você está prestes a enviar ${contactsWithValidEmails.length} emails imediatamente. ` +
        `Deseja continuar?`
      );
      if (!proceed) return;
    }

    try {
      setSendingNow(true);
      
      // Buscar dados do template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', formData.template_id)
        .eq('user_id', user.id)
        .single();

      if (templateError || !templateData) {
        throw new Error('Template não encontrado');
      }

      // Usar configurações do hook useSettings
      console.log("🔧 Configurações SMTP:", settings);

      if (!settings?.smtp_host) {
        throw new Error('SMTP não configurado. Vá em Settings > Email e configure seu SMTP.');
      }

      // CORREÇÃO: Usar hook useBatchEmailSending para envio em lote
      if (contactsWithValidEmails.length > 1) {
        console.log("🚀 Usando envio em lote otimizado");
        
        // Preparar dados dos contatos selecionados
        const selectedContactsData = contactsWithValidEmails.map(contactId => {
          const contact = currentList.find(c => c.id === contactId);
          return {
            id: contactId,
            email: contact?.email,
            name: contatoTipo === 'contact' ? contact?.name : contact?.fantasy_name,
            ...contact
          };
        }).filter(contact => contact.email);

        const result = await sendBatchEmails(
          selectedContactsData,
          formData.template_id,
          formData.custom_subject || (templateData as any).nome || '',
          formData.custom_content || (templateData as any).conteudo || ''
        );

        if (result && result.success) {
          toast.success(`🎉 ${result.totalSent} email(s) enviado(s) com sucesso!`);
          
          // Limpar seleção
          setSelectedContacts([]);
          setFormData({ template_id: '', data_envio: '', hora_envio: '', custom_subject: '', custom_content: '' });
          onCreatingChange(false);
          fetchData();
          fetchSchedules();
        }
        
        return;
      }

      // CORREÇÃO: Envio individual usando formato do Rocktmail
      const selectedContact = currentList.find(c => c.id === contactsWithValidEmails[0]);
      const contactName = contatoTipo === 'contact' ? selectedContact?.name : selectedContact?.fantasy_name;
      
      if (!selectedContact || !selectedContact.email) {
        toast.error("Contato selecionado não possui email válido");
        return;
      }

      toast.info(`Iniciando envio para ${contactName}...`);

      // Preparar dados no formato do Rocktmail para envio individual
      const emailData = {
        to: selectedContact.email,
        contato_id: selectedContact.id,
        template_id: formData.template_id,
        contato_nome: contactName || 'Destinatário',
        subject: formData.custom_subject || (templateData as any).nome || (templateData as any).descricao || '',
        content: formData.custom_content || (templateData as any).conteudo || '',
        template_nome: (templateData as any).nome || '',
        contact: {
          ...selectedContact,
          user_id: user.id,
          nome: contactName,
          email: selectedContact.email
        },
        user_id: user.id,
        image_url: (templateData as any).image_url || '',
        signature_image: settings?.signature_image || (templateData as any).signature_image || '',
        attachments: (templateData as any).attachments || [],
        smtp_settings: {
          host: settings.smtp_host,
          port: settings.email_porta || 587,
          secure: settings.smtp_seguranca === 'ssl',
          password: settings.smtp_pass,
          from_name: settings.smtp_from_name || 'Sistema Email',
          from_email: settings.email_usuario || ''
        },
        use_smtp: true
      };

      console.log("📧 Enviando email individual:", {
        to: emailData.to,
        subject: emailData.subject,
        template_id: emailData.template_id,
        has_smtp: !!emailData.smtp_settings.host
      });

      // Enviar via Edge Function - usar função test-send-email
      const response = await supabase.functions.invoke('test-send-email', {
        body: emailData
      });

      console.log("📧 Resposta da Edge Function:", response);

      if (response.error) {
        console.error("❌ Erro na Edge Function:", response.error);
        throw new Error(response.error.message || 'Erro ao enviar email');
      }

      const result = response.data;
      console.log("📧 Resultado do envio:", result);
      
      if (result && result.success) {
        toast.success(`🎉 Email enviado com sucesso para ${contactName}!`);
        
        // Salvar no histórico
        try {
          await (supabase as any)
            .from('envios_historico')
            .insert([{
              user_id: user.id,
              destinatario_nome: contactName || '',
              destinatario_email: selectedContact.email || '',
              remetente_nome: settings?.smtp_from_name || 'Sistema Email',
              remetente_email: settings?.email_usuario || '',
              status: 'enviado',
              data_envio: new Date().toISOString(),
              tipo_envio: 'individual'
            }]);
        } catch (err) {
          console.error('Erro ao salvar no histórico:', err);
        }

        // Limpar seleção
        setSelectedContacts([]);
        setFormData({ template_id: '', data_envio: '', hora_envio: '', custom_subject: '', custom_content: '' });
        onCreatingChange(false);
        fetchData();
        fetchSchedules();
      } else {
        console.error("❌ Falha no envio:", result);
        throw new Error(result?.error || result?.message || 'Falha no envio');
      }

    } catch (error: any) {
      console.error('Erro ao enviar emails:', error);
      toast.error(`Erro ao enviar emails: ${error.message}`);
    } finally {
      setSendingNow(false);
    }
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        if (!bulkMode) {
          return [contactId]; // Seleção única se não estiver em modo bulk
        }
        return [...prev, contactId]; // Seleção múltipla se estiver em modo bulk
      }
    });
  };

  const handleSelectAll = () => {
    const currentList = filteredContacts();
    if (selectedContacts.length === currentList.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(currentList.map(item => item.id));
      setBulkMode(true);
    }
  };

  const toggleBulkMode = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setBulkMode(isChecked);
    if (!isChecked && selectedContacts.length > 1) {
      setSelectedContacts([selectedContacts[0]]);
    }
  };

  const getSelectedContactsData = () => {
    const currentList = contatoTipo === 'contact' ? contacts : companies;
    return selectedContacts.map(contactId => 
      currentList.find(c => c.id === contactId)
    ).filter(Boolean);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      enviado: { label: 'Enviado', variant: 'default' as const },
      erro: { label: 'Erro', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredContacts = () => {
    const currentList = contatoTipo === 'contact' ? contacts : companies;
    return currentList.filter(item => {
      const name = contatoTipo === 'contact' ? item.name : item.fantasy_name;
      const email = item.email || '';
      
      return (
        (name && name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário de criação */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Novo Agendamento
            </CardTitle>
            <CardDescription>
              Agende o envio de um template de email para múltiplos destinatários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Template *</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Destinatário */}
            <div className="space-y-2">
              <Label htmlFor="contato_tipo">Tipo de Destinatário *</Label>
              <Select value={contatoTipo} onValueChange={(value: 'contact' | 'company') => {
                setContatoTipo(value);
                setSelectedContacts([]);
                setSearchQuery('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contatos ({contacts.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Empresas ({companies.length})
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Destinatários */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Destinatários *</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedContacts.length === filteredContacts().length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar destinatários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de destinatários */}
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-48">
                    <div className="p-4 space-y-2">
                      {filteredContacts().map((item) => {
                        const name = contatoTipo === 'contact' ? item.name : item.fantasy_name;
                        const email = item.email || 'Sem email';
                        
                        return (
                          <div key={item.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                            <Checkbox
                              id={item.id}
                              checked={selectedContacts.includes(item.id)}
                              onCheckedChange={() => handleContactToggle(item.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{name || 'Nome não informado'}</span>
                              </div>
                              <p className="text-sm text-gray-500">{email}</p>
                            </div>
                          </div>
                        );
                      })}
                      {filteredContacts().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum destinatário encontrado</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Contador de selecionados */}
              {selectedContacts.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  {selectedContacts.length} destinatário(s) selecionado(s)
                </div>
              )}

              {/* Mostrar total de destinatários disponíveis */}
              <div className="text-xs text-gray-500">
                {filteredContacts().length} de {contatoTipo === 'contact' ? contacts.length : companies.length} {contatoTipo === 'contact' ? 'contatos' : 'empresas'} disponíveis
              </div>
            </div>

            {/* Data e Hora */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_envio">Data *</Label>
                  <Input
                    id="data_envio"
                    type="date"
                    value={formData.data_envio}
                    onChange={(e) => setFormData({...formData, data_envio: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_envio">Hora *</Label>
                  <Input
                    id="hora_envio"
                    type="time"
                    value={formData.hora_envio}
                    onChange={(e) => setFormData({...formData, hora_envio: e.target.value})}
                  />
                </div>
              </div>

              {/* Informações sobre os tipos de envio */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Send className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Opções de Envio</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Enviar Agora:</strong> Envia os emails imediatamente para todos os destinatários selecionados.</p>
                      <p><strong>Agendar:</strong> Programa o envio para uma data e hora específicas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleSendNow}
              disabled={selectedContacts.length === 0 || sendingNow || !formData.template_id}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendingNow ? 'Enviando...' : `Enviar Agora (${selectedContacts.length})`}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                onCreatingChange(false);
                setSelectedContacts([]);
                setFormData({ template_id: '', data_envio: '', hora_envio: '', custom_subject: '', custom_content: '' });
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAgendamento} disabled={selectedContacts.length === 0} className="text-white">
                <CalendarIcon className="h-4 w-4 mr-2 text-white" />
                Agendar ({selectedContacts.length})
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Lista de agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos ({schedules.length})
          </CardTitle>
          <CardDescription>
            Lista de emails agendados para envio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedulesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
              <p>Carregando agendamentos...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
              <p className="text-sm">Clique no botão + para criar um novo agendamento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((agendamento) => {
                // Buscar dados do contato/empresa e template localmente
                const contact = agendamento.contato_tipo === 'company' 
                  ? companies.find(c => c.id === agendamento.contato_id)
                  : contacts.find(c => c.id === agendamento.contato_id);
                const template = templates.find(t => t.id === agendamento.template_id);
                
                const contactName = agendamento.contato_tipo === 'company' 
                  ? contact?.fantasy_name 
                  : contact?.name;
                const contactEmail = contact?.email;

                return (
                  <div key={agendamento.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{template?.nome || 'Template não encontrado'}</h4>
                          {getStatusBadge(agendamento.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Destinatário:</strong> {contactName || 'N/A'} ({contactEmail || 'N/A'})
                          </p>
                          <p><strong>Data/Hora:</strong> {format(new Date(agendamento.data_envio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                          <p><strong>Tipo:</strong> {agendamento.contato_tipo === 'company' ? 'Empresa' : 'Contato'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAgendamento(agendamento.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}