-- SQL para configurar cron job no Supabase para processar emails agendados
-- Execute este SQL no Supabase SQL Editor

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remover job existente apenas se existir (ignorar erro se não existir)
DO $$
BEGIN
    PERFORM cron.unschedule('process-scheduled-emails-job');
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar erro se o job não existir
        NULL;
END $$;

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
SELECT jobid, schedule, command FROM cron.job WHERE jobname = 'process-scheduled-emails-job';

-- Verificar logs do cron (opcional)
-- SELECT * FROM cron.job_run_details WHERE jobname = 'process-scheduled-emails-job' ORDER BY start_time DESC LIMIT 10;
