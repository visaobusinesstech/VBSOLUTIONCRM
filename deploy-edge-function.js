// Script para fazer deploy da Edge Function via API
const fs = require('fs');
const path = require('path');

async function deployEdgeFunction() {
  console.log("🚀 Fazendo deploy da Edge Function send-email...");
  
  try {
    // Ler o arquivo da Edge Function
    const functionPath = path.join(__dirname, 'frontend/supabase/functions/send-email');
    const indexPath = path.join(functionPath, 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Arquivo não encontrado: ${indexPath}`);
    }
    
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const optimizedProcessorPath = path.join(functionPath, 'optimized-processor.ts');
    const optimizedProcessorContent = fs.readFileSync(optimizedProcessorPath, 'utf8');
    
    console.log("✅ Arquivos da Edge Function carregados");
    console.log("📝 Tamanho do index.ts:", indexContent.length, "caracteres");
    console.log("📝 Tamanho do optimized-processor.ts:", optimizedProcessorContent.length, "caracteres");
    
    // Criar um bundle simples
    const bundle = `
// Edge Function Bundle - send-email
${indexContent}

// Inline optimized-processor
${optimizedProcessorContent}
`;
    
    console.log("📦 Bundle criado com sucesso");
    console.log("📝 Tamanho total do bundle:", bundle.length, "caracteres");
    
    // Salvar bundle temporário
    const bundlePath = path.join(__dirname, 'send-email-bundle.ts');
    fs.writeFileSync(bundlePath, bundle);
    
    console.log("✅ Bundle salvo em:", bundlePath);
    console.log("🎯 Para fazer deploy manual:");
    console.log("1. Acesse: https://supabase.com/dashboard/project/nrbsocawokmihvxfcpso/functions");
    console.log("2. Clique em 'Create a new function'");
    console.log("3. Nome: send-email");
    console.log("4. Cole o conteúdo do arquivo:", bundlePath);
    console.log("5. Clique em 'Deploy'");
    
  } catch (error) {
    console.error("❌ Erro ao preparar deploy:", error.message);
  }
}

deployEdgeFunction();
