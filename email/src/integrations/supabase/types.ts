export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          contato_id: string
          created_at: string
          data_envio: string
          id: string
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          contato_id: string
          created_at?: string
          data_envio: string
          id?: string
          status?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          contato_id?: string
          created_at?: string
          data_envio?: string
          id?: string
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          area_negocio: string | null
          created_at: string | null
          email_porta: number | null
          email_senha: string | null
          email_smtp: string | null
          email_usuario: string | null
          foto_perfil: string | null
          id: string
          signature_image: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_nome: string | null
          smtp_pass: string | null
          smtp_seguranca: string | null
          two_factor_enabled: boolean | null
          use_smtp: boolean | null
          user_id: string
          whatsapp_token: string | null
        }
        Insert: {
          area_negocio?: string | null
          created_at?: string | null
          email_porta?: number | null
          email_senha?: string | null
          email_smtp?: string | null
          email_usuario?: string | null
          foto_perfil?: string | null
          id?: string
          signature_image?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_nome?: string | null
          smtp_pass?: string | null
          smtp_seguranca?: string | null
          two_factor_enabled?: boolean | null
          use_smtp?: boolean | null
          user_id: string
          whatsapp_token?: string | null
        }
        Update: {
          area_negocio?: string | null
          created_at?: string | null
          email_porta?: number | null
          email_senha?: string | null
          email_smtp?: string | null
          email_usuario?: string | null
          foto_perfil?: string | null
          id?: string
          signature_image?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_nome?: string | null
          smtp_pass?: string | null
          smtp_seguranca?: string | null
          two_factor_enabled?: boolean | null
          use_smtp?: boolean | null
          user_id?: string
          whatsapp_token?: string | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          cliente: string | null
          created_at: string
          email: string
          id: string
          nome: string
          razao_social: string | null
          tags: string[] | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          cliente?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          razao_social?: string | null
          tags?: string[] | null
          telefone?: string | null
          user_id: string
        }
        Update: {
          cliente?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          razao_social?: string | null
          tags?: string[] | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      envios: {
        Row: {
          attachments: Json | null
          contato_id: string
          data_envio: string
          erro: string | null
          id: string
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          contato_id: string
          data_envio?: string
          erro?: string | null
          id?: string
          status: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          contato_id?: string
          data_envio?: string
          erro?: string | null
          id?: string
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envios_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      envios_email: {
        Row: {
          agendamento_id: string | null
          assunto: string | null
          contato_id: string | null
          created_at: string
          data_hora_envio: string
          destinatario_email: string
          destinatario_nome: string | null
          duracao_envio_ms: number | null
          id: string
          mensagem_erro: string | null
          resposta_servidor: Json | null
          smtp_utilizado_id: string | null
          status: string
          template_id: string | null
          tipo_operacao: string
          user_id: string
        }
        Insert: {
          agendamento_id?: string | null
          assunto?: string | null
          contato_id?: string | null
          created_at?: string
          data_hora_envio?: string
          destinatario_email: string
          destinatario_nome?: string | null
          duracao_envio_ms?: number | null
          id?: string
          mensagem_erro?: string | null
          resposta_servidor?: Json | null
          smtp_utilizado_id?: string | null
          status: string
          template_id?: string | null
          tipo_operacao: string
          user_id: string
        }
        Update: {
          agendamento_id?: string | null
          assunto?: string | null
          contato_id?: string | null
          created_at?: string
          data_hora_envio?: string
          destinatario_email?: string
          destinatario_nome?: string | null
          duracao_envio_ms?: number | null
          id?: string
          mensagem_erro?: string | null
          resposta_servidor?: Json | null
          smtp_utilizado_id?: string | null
          status?: string
          template_id?: string | null
          tipo_operacao?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envios_email_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_email_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_email_smtp_utilizado_id_fkey"
            columns: ["smtp_utilizado_id"]
            isOneToOne: false
            referencedRelation: "smtp_configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_email_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      envios_historico: {
        Row: {
          contato_id: string | null
          created_at: string
          data_envio: string
          destinatario_email: string
          destinatario_nome: string
          id: string
          mensagem_erro: string | null
          remetente_email: string
          remetente_nome: string
          status: string
          template_id: string | null
          template_nome: string | null
          tipo_envio: string
          user_id: string
        }
        Insert: {
          contato_id?: string | null
          created_at?: string
          data_envio?: string
          destinatario_email: string
          destinatario_nome: string
          id?: string
          mensagem_erro?: string | null
          remetente_email: string
          remetente_nome: string
          status?: string
          template_id?: string | null
          template_nome?: string | null
          tipo_envio: string
          user_id: string
        }
        Update: {
          contato_id?: string | null
          created_at?: string
          data_envio?: string
          destinatario_email?: string
          destinatario_nome?: string
          id?: string
          mensagem_erro?: string | null
          remetente_email?: string
          remetente_nome?: string
          status?: string
          template_id?: string | null
          template_nome?: string | null
          tipo_envio?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      smtp_configuracoes: {
        Row: {
          ativo: boolean
          created_at: string
          email_origem: string
          host: string
          id: string
          nome_configuracao: string
          porta: number
          senha_criptografada: string
          tipo_envio: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email_origem: string
          host: string
          id?: string
          nome_configuracao?: string
          porta?: number
          senha_criptografada: string
          tipo_envio?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email_origem?: string
          host?: string
          id?: string
          nome_configuracao?: string
          porta?: number
          senha_criptografada?: string
          tipo_envio?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          assinatura: string | null
          attachments: Json | null
          canal: string
          conteudo: string
          created_at: string
          descricao: string | null
          font_size_px: string | null
          id: string
          image_url: string | null
          nome: string
          signature_image: string | null
          status: string
          template_file_name: string | null
          template_file_url: string | null
          user_id: string
        }
        Insert: {
          assinatura?: string | null
          attachments?: Json | null
          canal: string
          conteudo: string
          created_at?: string
          descricao?: string | null
          font_size_px?: string | null
          id?: string
          image_url?: string | null
          nome: string
          signature_image?: string | null
          status?: string
          template_file_name?: string | null
          template_file_url?: string | null
          user_id: string
        }
        Update: {
          assinatura?: string | null
          attachments?: Json | null
          canal?: string
          conteudo?: string
          created_at?: string
          descricao?: string | null
          font_size_px?: string | null
          id?: string
          image_url?: string | null
          nome?: string
          signature_image?: string | null
          status?: string
          template_file_name?: string | null
          template_file_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      encrypt_smtp_password: {
        Args: { plain_password: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
