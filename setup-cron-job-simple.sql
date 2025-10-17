-- SQL SIMPLIFICADO para configurar cron job no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar o cron job para processar emails agendados a cada minuto
SELECT cron.schedule(
  'process-scheduled-emails-job',
  '* * * * *', -- A cada minuto
  $$
  SELECT
    net.http_post(
        url := 'https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/process-scheduled-emails',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnNvY2F3b2ttaWh2eGZjcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3NDA1MywiZXhwIjoyMDcyMDUwMDUzfQ.w6EJDzQj1fffHJ4lYzOVDLydqhbhGOW5KtGBDjaHfPA"}'::jsonb,
        body := '{"triggered_by": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Verificar se o job foi criado
SELECT 
    jobid, 
    schedule, 
    jobname,
    active,
    command 
FROM cron.job 
WHERE jobname = 'process-scheduled-emails-job';
