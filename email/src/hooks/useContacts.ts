
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type Contact = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  razao_social: string | null;
  cliente: string | null;
  created_at: string;
  tags?: string[];
};

export type ContactFormData = {
  nome: string;
  email: string;
  telefone?: string;
  razao_social?: string;
  cliente?: string;
  tags?: string[];
};

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Contact type, ensuring all required fields exist
      const transformedContacts: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        nome: contact.nome,
        email: contact.email,
        telefone: contact.telefone,
        razao_social: contact.razao_social || null,
        cliente: contact.cliente || null,
        created_at: contact.created_at,
        tags: contact.tags || []
      }));
      
      setContacts(transformedContacts);
    } catch (error: any) {
      toast.error('Erro ao carregar contatos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (formData: ContactFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar contatos');
      return false;
    }

    try {
      const { error } = await supabase
        .from('contatos')
        .insert([{ ...formData, user_id: user.id }]);

      if (error) throw error;
      toast.success('Contato criado com sucesso!');
      await fetchContacts();
      return true;
    } catch (error: any) {
      toast.error('Erro ao criar contato: ' + error.message);
      return false;
    }
  };

  const updateContact = async (id: string, formData: ContactFormData) => {
    try {
      const { error } = await supabase
        .from('contatos')
        .update(formData)
        .eq('id', id);

      if (error) throw error;
      toast.success('Contato atualizado com sucesso!');
      await fetchContacts();
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar contato: ' + error.message);
      return false;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      toast.loading('Removendo contato e registros relacionados...');
      
      // Usar a edge function para excluir o contato e registros relacionados
      const response = await supabase.functions.invoke('handle-contact-delete', {
        body: { contactId: id },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.dismiss();
      toast.success('Contato excluído com sucesso!');
      await fetchContacts();
      return true;
    } catch (error: any) {
      toast.dismiss();
      toast.error('Erro ao excluir contato: ' + error.message);
      return false;
    }
  };
  
  const getTags = () => {
    // Extract all unique tags from contacts
    const allTags = new Set<string>();
    contacts.forEach(contact => {
      if (contact.tags && contact.tags.length) {
        contact.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags);
  };

  return {
    contacts,
    loading,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    getTags,
  };
}
