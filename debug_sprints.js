/**
 * Script de debug para verificar o sistema de Sprints
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nrbsocawokmihvxfcpso.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnNvY2F3b2ttaWh2eGZjcHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3NDA1MywiZXhwIjoyMDcyMDUwMDUzfQ.w6EJDzQj1fffHJ4lYzOVDLydqhbhGOW5KtGBDjaHfPA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugSprints() {
  console.log('🔍 Debugando sistema de Sprints...');
  
  try {
    // 1. Verificar estrutura da tabela sprints
    console.log('\n📋 Verificando tabela sprints...');
    const { data: sprintsData, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .limit(5);
    
    if (sprintsError) {
      console.error('❌ Erro ao buscar sprints:', sprintsError);
    } else {
      console.log('✅ Sprints encontradas:', sprintsData);
    }
    
    // 2. Verificar estrutura da tabela activities
    console.log('\n📋 Verificando tabela activities...');
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id, title, status, sprint_id')
      .limit(5);
    
    if (activitiesError) {
      console.error('❌ Erro ao buscar activities:', activitiesError);
    } else {
      console.log('✅ Activities encontradas:', activitiesData);
    }
    
    // 3. Testar criação de uma sprint
    console.log('\n🧪 Testando criação de sprint...');
    const testSprint = {
      nome: 'Sprint Teste Debug',
      data_inicio: new Date().toISOString(),
      status: 'em_andamento',
      owner_id: '00000000-0000-0000-0000-000000000000' // UUID fictício para teste
    };
    
    const { data: newSprint, error: createError } = await supabase
      .from('sprints')
      .insert(testSprint)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar sprint:', createError);
    } else {
      console.log('✅ Sprint criada com sucesso:', newSprint);
      
      // Deletar sprint de teste
      await supabase
        .from('sprints')
        .delete()
        .eq('id', newSprint.id);
      console.log('🗑️ Sprint de teste removida');
    }
    
    // 4. Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'sprints');
    
    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas:', policiesError.message);
    } else {
      console.log('✅ Políticas encontradas:', policies);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugSprints();
