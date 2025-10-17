import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Paperclip, 
  X, 
  Save,
  Eye,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

interface EmailTemplatesProps {
  isCreating: boolean;
  onCreatingChange: (creating: boolean) => void;
}

interface TemplateVariable {
  name: string;
  value: string;
}

interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export function EmailTemplatesComplete({ isCreating, onCreatingChange }: EmailTemplatesProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    conteudo: '',
    image_url: '',
    attachments: [] as Attachment[],
    variables: [] as TemplateVariable[]
  });

  const [newVariable, setNewVariable] = useState({ name: '', value: '' });

  useEffect(() => {
    if (user?.id) {
      fetchTemplates();
    }
  }, [user]);

  useEffect(() => {
    if (isCreating && !selectedTemplate) {
      setFormData({ 
        nome: '', 
        descricao: '',
        conteudo: '', 
        image_url: '',
        attachments: [],
        variables: []
      });
      setIsEditing(false);
    }
  }, [isCreating]);

  const fetchTemplates = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `email-templates/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('template-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('template-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`O arquivo ${file.name} deve ter no máximo 25MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `email-attachments/${user?.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('template-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Erro ao fazer upload:', error);
          toast.error(`Erro ao fazer upload do arquivo ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('template-attachments')
          .getPublicUrl(filePath);

        newAttachments.push({
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type
        });
      }

      setFormData({ 
        ...formData, 
        attachments: [...formData.attachments, ...newAttachments]
      });
      
      toast.success(`${newAttachments.length} arquivo(s) anexado(s) com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const addVariable = () => {
    if (!newVariable.name || !newVariable.value) {
      toast.error('Preencha o nome e o valor da variável');
      return;
    }

    if (formData.variables.some(v => v.name === newVariable.name)) {
      toast.error('Já existe uma variável com este nome');
      return;
    }

    setFormData({
      ...formData,
      variables: [...formData.variables, { ...newVariable }]
    });
    setNewVariable({ name: '', value: '' });
    toast.success('Variável adicionada!');
  };

  const removeVariable = (index: number) => {
    const newVariables = [...formData.variables];
    newVariables.splice(index, 1);
    setFormData({ ...formData, variables: newVariables });
  };

  const insertFormatting = (tag: string, value?: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.conteudo.substring(start, end);
    const before = formData.conteudo.substring(0, start);
    const after = formData.conteudo.substring(end);

    let formattedText = '';
    switch (tag) {
      case 'b':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'i':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'u':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText}</h1>`;
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>${selectedText || 'Item'}</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>${selectedText || 'Item'}</li>\n</ol>`;
        break;
      case 'left':
        formattedText = `<div style="text-align: left;">${selectedText}</div>`;
        break;
      case 'center':
        formattedText = `<div style="text-align: center;">${selectedText}</div>`;
        break;
      case 'right':
        formattedText = `<div style="text-align: right;">${selectedText}</div>`;
        break;
      case 'font':
        if (value) formattedText = `<span style="font-family: ${value};">${selectedText}</span>`;
        break;
      case 'size':
        if (value) formattedText = `<span style="font-size: ${value};">${selectedText}</span>`;
        break;
      case 'color':
        if (value) formattedText = `<span style="color: ${value};">${selectedText}</span>`;
        break;
      case 'link':
        const url = prompt('Digite a URL:');
        if (url) formattedText = `<a href="${url}">${selectedText || url}</a>`;
        break;
      case 'img':
        imageInputRef.current?.click();
        return;
      default:
        return;
    }

    const newContent = before + formattedText + after;
    setFormData({ ...formData, conteudo: newContent });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const insertImageUrl = () => {
    const url = prompt('Digite a URL da imagem:');
    if (!url) return;

    const imageTag = `<img src="${url}" alt="Imagem" style="max-width: 100%; height: auto;" />`;
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = formData.conteudo.substring(0, start);
    const after = formData.conteudo.substring(start);
    
    setFormData({ ...formData, conteudo: before + imageTag + after });
  };

  const insertVariable = (variableName: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = formData.conteudo.substring(0, start);
    const after = formData.conteudo.substring(start);
    const variable = `{${variableName}}`;
    
    setFormData({ ...formData, conteudo: before + variable + after });
    
    // Focar no textarea e posicionar o cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleSaveTemplate = async () => {
    if (!user?.id) return;
    if (!formData.nome || !formData.conteudo) {
      toast.error('Preencha o nome e o conteúdo do template');
      return;
    }

    try {
      const templateData = {
        nome: formData.nome,
        descricao: formData.descricao,
        conteudo: formData.conteudo,
        user_id: user.id,
        owner_id: user.id,
        canal: 'email',
        status: 'ativo',
        image_url: formData.image_url || null,
        attachments: JSON.stringify(formData.attachments),
        signature_image: settings?.signature_image || null,
        assinatura: null
      };

      if (isEditing && selectedTemplate) {
        const { error } = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Template atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('templates')
          .insert([templateData]);

        if (error) throw error;
        toast.success('Template criado com sucesso!');
      }

      onCreatingChange(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    }
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    
    let attachments: Attachment[] = [];
    try {
      if (template.attachments) {
        if (typeof template.attachments === 'string') {
          attachments = JSON.parse(template.attachments);
        } else if (Array.isArray(template.attachments)) {
          attachments = template.attachments;
        }
      }
    } catch (e) {
      console.error('Erro ao parsear anexos:', e);
    }

    setFormData({
      nome: template.nome,
      descricao: template.descricao || '',
      conteudo: template.conteudo,
      image_url: template.image_url || '',
      attachments: attachments,
      variables: template.variables || []
    });
    setIsEditing(true);
    onCreatingChange(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template excluído com sucesso!');
      fetchTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  const handleDuplicate = async (template: any) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('templates')
        .insert([{
          ...template,
          id: undefined,
          nome: `${template.nome} (Cópia)`,
          user_id: user.id,
          owner_id: user.id,
          created_at: undefined,
          updated_at: undefined
        }]);

      if (error) throw error;
      toast.success('Template duplicado com sucesso!');
      fetchTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast.error('Erro ao duplicar template');
    }
  };

  const renderPreview = () => {
    let content = formData.conteudo;
    
    const defaultVariables = {
      nome: 'João Silva',
      email: 'joao.silva@exemplo.com',
      empresa: 'Empresa Exemplo',
      telefone: '(11) 99999-9999',
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR')
    };

    Object.entries(defaultVariables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    formData.variables.forEach(variable => {
      content = content.replace(new RegExp(`{${variable.name}}`, 'g'), variable.value);
    });

    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-white min-h-[400px]">
          {formData.image_url && (
            <div className="mb-4">
              <img 
                src={formData.image_url} 
                alt="Template" 
                className="max-w-full h-auto rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {settings?.signature_image && (
            <div className="mt-6 pt-4 border-t">
              <img 
                src={settings.signature_image} 
                alt="Assinatura" 
                className="max-w-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        {formData.attachments.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Anexos ({formData.attachments.length})
            </h4>
            <div className="space-y-1">
              {formData.attachments.map((att, idx) => (
                <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {att.name} ({(att.size / 1024).toFixed(2)} KB)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredTemplates = templates;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário - Lado Esquerdo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {isEditing ? 'Editar Template' : 'Novo Template'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preencha as informações do template de email
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <Label htmlFor="nome">Nome do Template *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Boas-vindas"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição breve do template (opcional)"
                    />
                  </div>

                  {/* Variáveis */}
                  <div className="space-y-2">
                    <Label>Variáveis Disponíveis (Clique para inserir)</Label>
                    <div className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded border">
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('nome')}
                      >
                        {'{nome}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('email')}
                      >
                        {'{email}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('empresa')}
                      >
                        {'{empresa}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('telefone')}
                      >
                        {'{telefone}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('data')}
                      >
                        {'{data}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('hora')}
                      >
                        {'{hora}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('cargo')}
                      >
                        {'{cargo}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('cidade')}
                      >
                        {'{cidade}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('estado')}
                      >
                        {'{estado}'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => insertVariable('pais')}
                      >
                        {'{pais}'}
                      </Badge>
                    </div>
                    <Label className="text-xs">Variáveis Personalizadas</Label>
                    
                    {formData.variables.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {formData.variables.map((variable, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Badge 
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                              onClick={() => insertVariable(variable.name)}
                            >
                              {`{${variable.name}}`}
                            </Badge>
                            <span className="text-sm flex-1">= {variable.value}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariable(idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da variável"
                        value={newVariable.name}
                        onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Valor padrão"
                        value={newVariable.value}
                        onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                        className="flex-1"
                      />
                      <Button onClick={addVariable} size="sm" className="text-white">
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <Label htmlFor="conteudo">Conteúdo do Email *</Label>
                    
                    {/* Barra de ferramentas */}
                    <div className="space-y-2 mb-2 p-3 border rounded bg-gray-50">
                      <div className="flex gap-2">
                        <select 
                          className="text-sm px-2 py-1 border rounded"
                          onChange={(e) => insertFormatting('font', e.target.value)}
                          defaultValue=""
                        >
                          <option value="">Fonte</option>
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Helvetica">Helvetica</option>
                        </select>
                        
                        <select 
                          className="text-sm px-2 py-1 border rounded"
                          onChange={(e) => insertFormatting('size', e.target.value)}
                          defaultValue=""
                        >
                          <option value="">Tamanho</option>
                          <option value="12px">12px</option>
                          <option value="14px">14px</option>
                          <option value="16px">16px</option>
                          <option value="18px">18px</option>
                          <option value="20px">20px</option>
                          <option value="24px">24px</option>
                          <option value="28px">28px</option>
                          <option value="32px">32px</option>
                        </select>
                        
                        <input 
                          type="color"
                          className="w-10 h-8 border rounded cursor-pointer"
                          onChange={(e) => insertFormatting('color', e.target.value)}
                          title="Cor do texto"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('b')}
                        title="Negrito"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('i')}
                        title="Itálico"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('u')}
                        title="Sublinhado"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('h1')}
                          title="Título 1"
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('ul')}
                          title="Lista"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('ol')}
                          title="Lista Numerada"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('left')}
                          title="Alinhar à Esquerda"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('center')}
                          title="Centralizar"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertFormatting('right')}
                          title="Alinhar à Direita"
                        >
                          <AlignRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('link')}
                        title="Inserir Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={insertImageUrl}
                          title="Inserir Imagem"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>

                    <Textarea
                      ref={contentRef}
                      id="conteudo"
                      value={formData.conteudo}
                      onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                      placeholder="Digite o conteúdo do email aqui. Use HTML e variáveis como {nome}, {email}, etc."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Upload de Imagem Principal */}
                  <div>
                    <Label>Imagem do Template (opcional)</Label>
                    <div className="mt-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {uploading ? 'Enviando...' : 'Carregar Imagem'}
                      </Button>
                    </div>
                    {formData.image_url && (
                      <div className="mt-2 relative">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="max-w-full h-auto rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Anexos */}
                  <div>
                    <Label>Anexos</Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        {uploading ? 'Enviando...' : 'Adicionar Anexos'}
                      </Button>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assinatura */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start gap-2">
                      <Edit className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Assinatura</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {settings?.signature_image 
                            ? 'A assinatura configurada em Settings será incluída automaticamente'
                            : 'Configure sua assinatura em Settings > Email para incluí-la nos templates'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onCreatingChange(false);
                        setSelectedTemplate(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTemplate} className="flex-1 text-white">
                      <Save className="h-4 w-4 mr-2 text-white" />
                      {isEditing ? 'Atualizar' : 'Criar'} Template
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview - Lado Direito */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-semibold">Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    Visualização em tempo real
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                {renderPreview()}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de templates */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.nome}
                </h4>
                <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'} className={template.status === 'ativo' ? 'text-white' : ''}>
                  {template.status}
                </Badge>
              </div>
              {template.descricao && (
                <p className="text-sm text-muted-foreground">{template.descricao}</p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.conteudo.replace(/<[^>]*>/g, '')}
              </p>
            </CardContent>
            <CardContent className="flex gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(template)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(template)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum template criado ainda
          </p>
          <Button onClick={() => onCreatingChange(true)} className="mt-4 text-white">
            <Plus className="h-4 w-4 mr-2 text-white" />
            Criar Primeiro Template
          </Button>
        </div>
      )}
    </div>
  );
}
