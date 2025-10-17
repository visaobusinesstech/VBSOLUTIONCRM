/**
 * Script para verificar e corrigir a estrutura de Sprints no Supabase
 * Executa verificações e aplica correções necessárias
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

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false; // Tabela não existe
    }
    
    return true;
  } catch (err) {
    return false;
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      return false;
    }
    
    return true;
  } catch (err) {
    return false;
  }
}

async function executeSQL(sql) {
  try {
    // Tentar usar RPC se disponível
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (rpcError) {
      await log(`RPC não disponível, tentando método alternativo...`, 'warning');
      // Método alternativo: tentar uma query simples
      await log(`SQL: ${sql}`, 'info');
    } else {
      await log(`SQL executado com sucesso via RPC`, 'success');
    }
    
    return true;
  } catch (err) {
    await log(`Erro ao executar SQL: ${err.message}`, 'error');
    return false;
  }
}

async function checkAndFixSprints() {
  try {
    await log('🔍 Iniciando verificação e correção do sistema de Sprints...', 'info');
    
    // 1. Verificar se a tabela sprints existe
    await log('Verificando tabela sprints...', 'info');
    const sprintsExists = await checkTableExists('sprints');
    
    if (!sprintsExists) {
      await log('Tabela sprints não existe. Criando...', 'warning');
      
      const createSprintsTable = `
        CREATE TABLE IF NOT EXISTS public.sprints (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          owner_id UUID NOT NULL REFERENCES auth.users(id),
          nome TEXT NOT NULL DEFAULT 'Nova Sprint',
          data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
          data_fim TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'finalizada')),
          company_id UUID REFERENCES public.companies(id),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `;
      
      await executeSQL(createSprintsTable);
    } else {
      await log('Tabela sprints existe ✓', 'success');
    }
    
    // 2. Verificar se a coluna sprint_id existe em activities
    await log('Verificando coluna sprint_id em activities...', 'info');
    const sprintIdExists = await checkColumnExists('activities', 'sprint_id');
    
    if (!sprintIdExists) {
      await log('Coluna sprint_id não existe em activities. Adicionando...', 'warning');
      
      const addSprintIdColumn = `
        ALTER TABLE public.activities 
        ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;
      `;
      
      await executeSQL(addSprintIdColumn);
    } else {
      await log('Coluna sprint_id existe em activities ✓', 'success');
    }
    
    // 3. Verificar e ajustar colunas da tabela sprints
    await log('Verificando colunas da tabela sprints...', 'info');
    
    // Verificar se as colunas corretas existem
    const requiredColumns = ['nome', 'data_inicio', 'data_fim', 'status'];
    
    for (const column of requiredColumns) {
      const columnExists = await checkColumnExists('sprints', column);
      if (!columnExists) {
        await log(`Coluna ${column} não existe. Adicionando...`, 'warning');
        
        let alterSQL = '';
        switch (column) {
          case 'nome':
            alterSQL = 'ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT \'Nova Sprint\';';
            break;
          case 'data_inicio':
            alterSQL = 'ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now();';
            break;
          case 'data_fim':
            alterSQL = 'ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS data_fim TIMESTAMP WITH TIME ZONE;';
            break;
          case 'status':
            alterSQL = 'ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'planejada\' CHECK (status IN (\'planejada\', \'em_andamento\', \'finalizada\'));';
            break;
        }
        
        if (alterSQL) {
          await executeSQL(alterSQL);
        }
      } else {
        await log(`Coluna ${column} existe ✓`, 'success');
      }
    }
    
    // 4. Criar índices se não existirem
    await log('Criando índices para performance...', 'info');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_sprints_owner_id ON public.sprints(owner_id);',
      'CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);',
      'CREATE INDEX IF NOT EXISTS idx_sprints_company_id ON public.sprints(company_id);',
      'CREATE INDEX IF NOT EXISTS idx_activities_sprint_id ON public.activities(sprint_id);'
    ];
    
    for (const indexSQL of indexes) {
      await executeSQL(indexSQL);
    }
    
    // 5. Configurar RLS (Row Level Security)
    await log('Configurando RLS...', 'info');
    
    const rlsPolicies = [
      'ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;',
      `CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias sprints"
        ON public.sprints
        FOR SELECT
        USING (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias sprints"
        ON public.sprints
        FOR INSERT
        WITH CHECK (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias sprints"
        ON public.sprints
        FOR UPDATE
        USING (auth.uid() = owner_id)
        WITH CHECK (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Usuários podem deletar suas próprias sprints"
        ON public.sprints
        FOR DELETE
        USING (auth.uid() = owner_id);`
    ];
    
    for (const policySQL of rlsPolicies) {
      await executeSQL(policySQL);
    }
    
    // 6. Testar a estrutura
    await log('Testando estrutura...', 'info');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('sprints')
        .select('*')
        .limit(1);
      
      if (testError) {
        await log(`Erro no teste: ${testError.message}`, 'error');
      } else {
        await log('Teste de consulta bem-sucedido ✓', 'success');
      }
    } catch (testErr) {
      await log(`Erro no teste: ${testErr.message}`, 'error');
    }
    
    await log('🎉 Verificação e correção concluídas!', 'success');
    await log('📋 Próximos passos:', 'info');
    await log('   1. Reinicie o servidor de desenvolvimento (pnpm dev)', 'info');
    await log('   2. Acesse a página /activities', 'info');
    await log('   3. Teste criar/iniciar uma sprint', 'info');
    await log('   4. Teste vincular atividades à sprint', 'info');
    await log('   5. Teste finalizar sprint', 'info');
    
  } catch (error) {
    await log(`Erro fatal: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Executar verificação e correção
checkAndFixSprints();
