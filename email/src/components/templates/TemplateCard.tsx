import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Send, Trash2, Copy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Template } from '@/types/template';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateEmail } from '@/hooks/useTemplates/useTemplateEmail';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => Promise<boolean>;
  onDuplicate?: (id: string) => void;
}

export const TemplateCard = ({ template, onEdit, onDelete, onDuplicate }: TemplateCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { sendTestEmail } = useTemplateEmail();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'rascunho':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get just a preview of the content
  const contentPreview = template.conteudo
    .replace(/\n/g, ' ')
    .slice(0, 100) + (template.conteudo.length > 100 ? '...' : '');

  const handleSendTest = async () => {
    if (!testEmail) return;
    
    setSending(true);
    try {
      await sendTestEmail(template.id, testEmail);
      setIsTestEmailDialogOpen(false);
      setTestEmail('');
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(template.id);
      toast.success('Template duplicado com sucesso!');
    }
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(template.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        toast.success('Template excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Falha ao excluir template. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-2">{template.nome}</h3>
          {template.status && getStatusLabel(template.status)}
        </div>
        
        {/* Display description if available */}
        {template.descricao && (
          <p className="text-sm text-muted-foreground mt-1 mb-2">{template.descricao}</p>
        )}
        
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Criado em: {formatDate(template.created_at)}</span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Prévia:</p>
          <div className="bg-muted p-4 rounded-md min-h-[80px] max-h-[120px] overflow-hidden">
            <p className="text-sm break-words overflow-ellipsis line-clamp-3">{contentPreview}</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {template.signature_image && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Assinatura
            </Badge>
          )}
          
          {template.attachments && template.attachments !== '[]' && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Anexos
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/40 px-6 py-4">
        <div className="w-full flex flex-wrap gap-2 justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(template)} 
            className="rounded-full h-10 w-10"
            title="Editar template"
          >
            <Edit className="h-5 w-5 text-blue-600" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsTestEmailDialogOpen(true)} 
            className="rounded-full h-10 w-10"
            title="Testar envio"
          >
            <Send className="h-5 w-5 text-green-600" />
          </Button>
          
          {onDuplicate && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDuplicate} 
              className="rounded-full h-10 w-10"
              title="Duplicar template"
            >
              <Copy className="h-5 w-5 text-purple-600" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete} 
            className="rounded-full h-10 w-10"
            title="Excluir template"
            disabled={isDeleting}
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </CardFooter>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "{template.nome}"?
              Esta ação não pode ser desfeita.
              <br /><br />
              Nota: Os envios e agendamentos que usavam este template serão mantidos, 
              mas a referência ao template será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Test email dialog */}
      <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Email de Teste</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="testEmail">Email para o teste</Label>
            <Input 
              id="testEmail" 
              type="email" 
              value={testEmail} 
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Digite o email para enviar o teste"
              autoComplete="email"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Um email de teste com este template será enviado para o endereço informado.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestEmailDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendTest} disabled={!testEmail || sending}>
              {sending ? 'Enviando...' : 'Enviar Teste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
