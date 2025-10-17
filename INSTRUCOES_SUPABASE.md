# Instruções para Configuração do Supabase

## 1. Criar Tabelas no Banco de Dados

Acesse o painel do Supabase em: https://nrbsocawokmihvxfcpso.supabase.co

Vá em **SQL Editor** e execute o script `create-tables.sql` que está na raiz do projeto.

## 2. Deploy das Edge Functions

As Edge Functions já estão na pasta `frontend/supabase/functions/`.

Para fazer deploy, execute:

```bash
cd frontend
npx supabase functions deploy send-email
npx supabase functions deploy process-scheduled-emails
npx supabase functions deploy test-smtp
```

## 3. Configurar Variáveis de Ambiente no Supabase

No painel do Supabase, vá em **Edge Functions** > **Settings** e adicione:

- SUPABASE_URL: https://nrbsocawokmihvxfcpso.supabase.co
- SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnNvY2F3b2ttaWh2eGZjcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3NDA1MywiZXhwIjoyMDcyMDUwMDUzfQ.w6EJDzQj1fffHJ4lYzOVDLydqhbhGOW5KtGBDjaHfPA

## 4. Testar o Sistema

Após configurar, teste:
1. Crie um template de email
2. Configure o SMTP em Settings
3. Crie um agendamento
4. Verifique o histórico de envios

