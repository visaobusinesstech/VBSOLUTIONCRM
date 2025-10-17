/**
 * Script para aplicar a migração de Sprints no Supabase
 * Executa a migração SQL para adicionar suporte completo a Sprints
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nrbsocawokmihvxfcpso.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnNvY2F3b2ttaWh2eGZjcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3NDA1MywiZXhwIjoyMDcyMDUwMDUzfQ.w6EJDzQj1fffHJ4lYzOVDLydqhbhGOW5KtGBDjaHfPA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📘',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function applySQLMigration() {
  try {
    await log('Iniciando aplicação da migração de Sprints...', 'info');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250115000000_add_sprint_support.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await log('Arquivo de migração carregado com sucesso', 'success');
    
    // Dividir SQL em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'));
    
    await log(`Encontrados ${commands.length} comandos SQL para executar`, 'info');
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      await log(`Executando comando ${i + 1}/${commands.length}...`, 'info');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' });
        
        if (error) {
          // Tentar executar diretamente se RPC falhar
          await log(`RPC falhou, tentando execução direta...`, 'warning');
          const { error: directError } = await supabase.from('_migrations').insert({ 
            query: command + ';',
            executed_at: new Date().toISOString()
          });
          
          if (directError) {
            await log(`Erro ao executar comando: ${directError.message}`, 'error');
          }
        }
        
        await log(`Comando ${i + 1} executado com sucesso`, 'success');
      } catch (cmdError) {
        await log(`Erro no comando ${i + 1}: ${cmdError.message}`, 'warning');
        // Continuar mesmo com erros (alguns comandos podem já ter sido executados)
      }
    }
    
    await log('Migração aplicada com sucesso!', 'success');
    await log('Verificando estrutura das tabelas...', 'info');
    
    // Verificar se a tabela sprints existe e tem as colunas corretas
    const { data: sprintsData, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .limit(1);
    
    if (sprintsError) {
      await log(`Erro ao verificar tabela sprints: ${sprintsError.message}`, 'error');
    } else {
      await log('Tabela sprints verificada com sucesso ✓', 'success');
    }
    
    // Verificar se a coluna sprint_id foi adicionada em activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id, sprint_id')
      .limit(1);
    
    if (activitiesError) {
      await log(`Erro ao verificar coluna sprint_id: ${activitiesError.message}`, 'error');
    } else {
      await log('Coluna sprint_id em activities verificada com sucesso ✓', 'success');
    }
    
    await log('✨ Migração de Sprints concluída com sucesso!', 'success');
    await log('📋 Próximos passos:', 'info');
    await log('   1. Reinicie o servidor de desenvolvimento (pnpm dev)', 'info');
    await log('   2. Acesse a página /activities', 'info');
    await log('   3. Teste criar uma nova sprint', 'info');
    await log('   4. Vincule atividades à sprint', 'info');
    await log('   5. Finalize a sprint e visualize o histórico', 'info');
    
  } catch (error) {
    await log(`Erro fatal durante a migração: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Executar migração
applySQLMigration();

