// Script para verificar configurações SMTP
// Execute no console do navegador na página de email

async function checkSmtpConfig() {
  console.log("🔧 Verificando configurações SMTP...");
  
  try {
    // Verificar se há configurações salvas
    const { data: settings, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error("❌ Erro ao buscar configurações:", error);
      return;
    }

    if (!settings) {
      console.warn("⚠️ Nenhuma configuração encontrada");
      return;
    }

    console.log("✅ Configurações encontradas:");
    console.log("- SMTP Host:", settings.smtp_host || "NÃO CONFIGURADO");
    console.log("- SMTP Port:", settings.email_porta || "NÃO CONFIGURADO");
    console.log("- SMTP Security:", settings.smtp_seguranca || "NÃO CONFIGURADO");
    console.log("- SMTP Username:", settings.email_usuario || "NÃO CONFIGURADO");
    console.log("- SMTP Password:", settings.smtp_pass ? "CONFIGURADO" : "NÃO CONFIGURADO");
    console.log("- From Name:", settings.smtp_from_name || "NÃO CONFIGURADO");

    // Verificar se está tudo configurado
    const requiredFields = ['smtp_host', 'email_porta', 'smtp_seguranca', 'email_usuario', 'smtp_pass'];
    const missingFields = requiredFields.filter(field => !settings[field]);
    
    if (missingFields.length > 0) {
      console.warn("⚠️ Campos obrigatórios faltando:", missingFields);
    } else {
      console.log("✅ Todas as configurações SMTP estão preenchidas");
    }

  } catch (error) {
    console.error("❌ Erro ao verificar configurações:", error);
  }
}

// Executar verificação
checkSmtpConfig();
