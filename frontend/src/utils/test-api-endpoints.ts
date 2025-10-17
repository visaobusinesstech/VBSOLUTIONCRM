// 🧪 Script de Teste para Validar APIs do Google Calendar
// Execute este arquivo no console do navegador ou crie um componente de teste

/**
 * ✅ TESTE 1: Verificar Status da Conexão Google
 */
export async function testGoogleConnectionStatus() {
  console.log('\n🔍 === TESTE 1: Status da Conexão Google ===\n');
  
  try {
    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
    const url = `${API_URL}/api/integrations/google/status`;
    
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', {
      contentType: response.headers.get('content-type'),
      statusText: response.statusText
    });
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ ERRO: Resposta não é JSON');
      console.error('Content-Type:', contentType);
      console.error('Conteúdo recebido:', text.substring(0, 500));
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Dados:', data);
    console.log('🔌 Conectado?', data.data?.connected || data.connected);
    
    return true;
  } catch (error) {
    console.error('❌ ERRO no teste 1:', error);
    return false;
  }
}

/**
 * ✅ TESTE 2: Buscar Eventos do Google Calendar
 */
export async function testFetchGoogleEvents() {
  console.log('\n📅 === TESTE 2: Buscar Eventos do Google ===\n');
  
  try {
    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
    
    // Definir intervalo de datas
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    const params = new URLSearchParams({
      timeMin: oneMonthAgo.toISOString(),
      timeMax: oneMonthFromNow.toISOString(),
      maxResults: '50',
      calendarId: 'primary'
    });
    
    const url = `${API_URL}/api/ai-agent/google-calendar/list-events?${params.toString()}`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ ERRO: Resposta não é JSON');
      console.error('Content-Type:', contentType);
      console.error('Conteúdo recebido:', text.substring(0, 500));
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Resposta:', data);
    
    if (data.success) {
      const events = data.data || data.events || [];
      console.log(`📦 ${events.length} eventos encontrados`);
      
      if (events.length > 0) {
        console.log('📝 Exemplo de evento:', events[0]);
      }
    } else {
      console.error('⚠️ API indicou falha:', data.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ ERRO no teste 2:', error);
    return false;
  }
}

/**
 * ✅ TESTE 3: Buscar Eventos Locais
 */
export async function testFetchLocalEvents(userId = 'SEU_USER_ID_AQUI') {
  console.log('\n📅 === TESTE 3: Buscar Eventos Locais ===\n');
  
  try {
    const url = '/api/calendar/events';
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer VB_DEV_TOKEN',
      },
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ ERRO: Resposta não é JSON');
      console.error('Content-Type:', contentType);
      console.error('Conteúdo recebido:', text.substring(0, 500));
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Resposta:', data);
    
    if (data.success) {
      const events = data.data || [];
      console.log(`📦 ${events.length} eventos locais encontrados`);
      
      if (events.length > 0) {
        console.log('📝 Exemplo de evento:', events[0]);
      }
    } else {
      console.error('⚠️ API indicou falha:', data.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ ERRO no teste 3:', error);
    return false;
  }
}

/**
 * ✅ TESTE 4: Testar Todas as Rotas
 */
export async function testAllEndpoints() {
  console.log('\n🧪 === EXECUTANDO TODOS OS TESTES ===\n');
  
  const results = {
    googleStatus: false,
    googleEvents: false,
    localEvents: false,
  };
  
  // Teste 1
  results.googleStatus = await testGoogleConnectionStatus();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Teste 2
  results.googleEvents = await testFetchGoogleEvents();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Teste 3
  results.localEvents = await testFetchLocalEvents();
  
  // Resumo
  console.log('\n📊 === RESUMO DOS TESTES ===\n');
  console.log('Status Google:', results.googleStatus ? '✅' : '❌');
  console.log('Eventos Google:', results.googleEvents ? '✅' : '❌');
  console.log('Eventos Locais:', results.localEvents ? '✅' : '❌');
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Total: ${totalPassed}/3 testes passaram\n`);
  
  return results;
}

/**
 * ✅ TESTE 5: Debug de Endpoint Específico
 */
export async function debugEndpoint(url: string, options: RequestInit = {}) {
  console.log('\n🔍 === DEBUG DE ENDPOINT ===\n');
  console.log('URL:', url);
  console.log('Options:', options);
  
  try {
    const response = await fetch(url, options);
    
    console.log('\n📊 RESPOSTA:');
    console.log('Status:', response.status, response.statusText);
    console.log('OK:', response.ok);
    console.log('URL final:', response.url);
    console.log('Redirected:', response.redirected);
    
    console.log('\n📋 HEADERS:');
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(headers);
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      console.log('\n✅ Content-Type é JSON');
      const data = await response.json();
      console.log('\n📦 DADOS:');
      console.log(data);
    } else {
      console.log('\n❌ Content-Type NÃO é JSON:', contentType);
      const text = await response.text();
      console.log('\n📄 CONTEÚDO (primeiros 1000 caracteres):');
      console.log(text.substring(0, 1000));
    }
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
}

// Tornar disponível no console do navegador
if (typeof window !== 'undefined') {
  (window as any).calendarTests = {
    testGoogleStatus: testGoogleConnectionStatus,
    testGoogleEvents: testFetchGoogleEvents,
    testLocalEvents: testFetchLocalEvents,
    testAll: testAllEndpoints,
    debug: debugEndpoint,
  };
  
  console.log(`
🧪 ===== TESTES DE API DISPONÍVEIS =====

Execute no console:

1️⃣ Testar status do Google:
   calendarTests.testGoogleStatus()

2️⃣ Testar busca de eventos do Google:
   calendarTests.testGoogleEvents()

3️⃣ Testar busca de eventos locais:
   calendarTests.testLocalEvents('SEU_USER_ID')

4️⃣ Executar todos os testes:
   calendarTests.testAll()

5️⃣ Debug de endpoint específico:
   calendarTests.debug('http://localhost:3000/api/endpoint', { 
     method: 'GET',
     headers: { 'Content-Type': 'application/json' }
   })

========================================
  `);
}
