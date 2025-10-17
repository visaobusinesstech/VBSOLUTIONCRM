
export interface Template {
  id: string;
  nome: string;
  conteudo: string;
  canal?: string;
  assinatura?: string;
  created_at?: string;
  user_id?: string;
  signature_image?: string | null;
  status?: string;
  attachments?: any;
  descricao?: string;
  template_file_url?: string | null;  
  template_file_name?: string | null;
  image_url?: string | null;
  font_size_px?: string;
}

export interface TemplateFormData {
  nome: string;
  conteudo: string;
  canal?: string; 
  assinatura?: string;
  signature_image?: string | null;
  status?: string;
  attachments?: any;
  descricao?: string;
  template_file_url?: string | null; 
  template_file_name?: string | null;
  image_url?: string | null;
  font_size_px?: string;
}
