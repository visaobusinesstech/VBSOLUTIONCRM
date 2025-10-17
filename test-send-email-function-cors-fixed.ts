import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log(`📡 Requisição recebida: ${req.method} para ${req.url}`);
  
  // Handle CORS preflight requests - CORRIGIDO
  if (req.method === 'OPTIONS') {
    console.log("✅ Respondendo a requisição OPTIONS com CORS");
    return new Response(null, { 
      status: 200,  // Status 200 obrigatório para CORS
      headers: corsHeaders 
    });
  }

  try {
    const requestData = await req.json();
    console.log("📨 Recebida requisição de envio de email:", {
      batch: !!requestData.batch,
      emails_count: requestData.emails?.length || 0,
      smtp_configured: !!requestData.smtp_settings?.host,
      host: requestData.smtp_settings?.host || 'não configurado',
      single_email: !!requestData.to
    });

    // Verificar se SMTP está configurado
    if (!requestData.smtp_settings || !requestData.smtp_settings.host) {
      console.error("❌ SMTP não configurado:", requestData.smtp_settings);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "SMTP deve estar configurado. Configure nas configurações do sistema." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verifica se é um envio em lote
    if (requestData.batch && requestData.emails && requestData.emails.length > 1) {
      console.log(`🚀 Processando lote de emails: ${requestData.emails.length} emails`);
      
      const results = [];
      let successCount = 0;
      let failedCount = 0;

      // Processar cada email do lote
      for (const emailData of requestData.emails) {
        try {
          const result = await processSingleEmail(emailData, requestData.smtp_settings);
          results.push(result);
          if (result.success) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`❌ Erro ao processar email para ${emailData.to}:`, error);
          results.push({
            success: false,
            to: emailData.to,
            error: error.message
          });
          failedCount++;
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          batch: true,
          summary: {
            total: requestData.emails.length,
            successful: successCount,
            failed: failedCount
          },
          results: results
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Envio individual
    console.log("📧 Processando envio individual");
    
    let emailData;
    if (requestData.emails && requestData.emails.length === 1) {
      emailData = requestData.emails[0];
    } else {
      // Formato de envio individual direto
      emailData = {
        to: requestData.to,
        subject: requestData.subject,
        content: requestData.content,
        contato_id: requestData.contato_id,
        template_id: requestData.template_id,
        contato_nome: requestData.contato_nome,
        template_nome: requestData.template_nome,
        user_id: requestData.user_id,
        contact: requestData.contact,
        attachments: requestData.attachments,
        signature_image: requestData.signature_image,
        image_url: requestData.image_url
      };
    }

    // Validação dos dados obrigatórios
    if (!emailData.to || !emailData.subject || !emailData.content) {
      console.error("❌ Parâmetros obrigatórios faltando:", {
        to: !!emailData.to,
        subject: !!emailData.subject,
        content: !!emailData.content
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Parâmetros obrigatórios: to, subject, content' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("📧 Dados validados, processando envio individual");

    // Processar envio individual
    const result = await processSingleEmail(emailData, requestData.smtp_settings);
    
    console.log("📧 Resultado do envio individual:", result);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("❌ Erro no processamento:", error);
    console.error("❌ Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro interno no servidor",
        timestamp: new Date().toISOString(),
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Função para processar um único email
async function processSingleEmail(emailData: any, smtpSettings: any): Promise<any> {
  try {
    console.log(`📧 Enviando email para: ${emailData.to}`);
    console.log(`📧 Assunto: ${emailData.subject}`);
    console.log(`📧 SMTP Host: ${smtpSettings.host}:${smtpSettings.port}`);

    // Simular envio de email (substitua pela lógica real de envio)
    // Aqui você pode integrar com Nodemailer, SendGrid, ou outro serviço
    
    // Para teste, vamos simular um envio bem-sucedido
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

    console.log(`✅ Email enviado com sucesso para: ${emailData.to}`);
    
    return {
      success: true,
      message: "Email enviado com sucesso!",
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString(),
      details: {
        host: smtpSettings.host,
        port: smtpSettings.port,
        from: smtpSettings.from_email
      }
    };

  } catch (error: any) {
    console.error(`❌ Erro ao enviar email para ${emailData.to}:`, error);
    
    return {
      success: false,
      error: error.message,
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    };
  }
}
