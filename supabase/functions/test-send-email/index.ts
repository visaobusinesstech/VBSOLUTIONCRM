import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import nodemailer from 'npm:nodemailer';

// CORS headers robustos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função de delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para obter data atual no formato brasileiro
function getDataHoje(): string {
  const hoje = new Date();
  return hoje.toLocaleDateString('pt-BR');
}

// Função para obter hora atual no formato brasileiro
function getHoraAtual(): string {
  const agora = new Date();
  return agora.toLocaleTimeString('pt-BR');
}

// Função para substituir variáveis no conteúdo do template
function substituirVariaveis(conteudo: string, contato: any): string {
  if (!conteudo) return '';
  
  console.log('🔄 Substituindo variáveis para:', contato?.nome || contato?.email);
  
  const variaveis: Record<string, string> = {
    '{nome}': contato?.nome || contato?.name || '',
    '{email}': contato?.email || '',
    '{telefone}': contato?.telefone || contato?.phone || '',
    '{razao_social}': contato?.razao_social || contato?.fantasy_name || '',
    '{cliente}': contato?.cliente || contato?.nome || contato?.name || '',
    '{empresa}': contato?.razao_social || contato?.fantasy_name || contato?.empresa || 'Empresa',
    '{endereco}': contato?.endereco || contato?.address || '',
    '{cargo}': contato?.cargo || contato?.position || '',
    '{produto}': contato?.produto || contato?.product || '',
    '{valor}': contato?.valor || contato?.value || '',
    '{vencimento}': contato?.vencimento || contato?.due_date || '',
    '{data}': getDataHoje(),
    '{hora}': getHoraAtual()
  };
  
  let conteudoProcessado = conteudo;
  
  // Substituir cada variável pelo valor correspondente
  Object.entries(variaveis).forEach(([variavel, valor]) => {
    const variavelEscapada = variavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(variavelEscapada, 'gi');
    conteudoProcessado = conteudoProcessado.replace(regex, valor);
  });
  
  console.log('🔄 Substituição realizada:', conteudoProcessado !== conteudo);
  
  return conteudoProcessado;
}

// Função para injetar imagens de URL no conteúdo HTML
function injetarImagensUrl(conteudo: string, imageUrl: string | null): string {
  if (!imageUrl) return conteudo;
  
  console.log('🖼️ Injetando imagem de URL no conteúdo:', imageUrl);
  
  if (conteudo.includes(imageUrl)) {
    console.log('🖼️ Imagem já presente no conteúdo');
    return conteudo;
  }
  
  const imagemHTML = `<div style="text-align: center; margin: 20px 0;">
    <img src="${imageUrl}" style="max-width: 100%; height: auto;" alt="Imagem do Template" />
  </div>`;
  
  let conteudoComImagem = conteudo;
  const primeiroParagrafo = conteudo.match(/<p[^>]*>.*?<\/p>/i);
  if (primeiroParagrafo) {
    conteudoComImagem = conteudo.replace(primeiroParagrafo[0], primeiroParagrafo[0] + imagemHTML);
  } else {
    conteudoComImagem = imagemHTML + conteudo;
  }
  
  console.log('🖼️ Imagem injetada com sucesso');
  return conteudoComImagem;
}

// Função para injetar assinatura digital no conteúdo HTML
function injetarAssinaturaDigital(conteudo: string, signatureImage: string | null): string {
  if (!signatureImage) return conteudo;
  
  console.log('✍️ Injetando assinatura digital no conteúdo');
  
  if (conteudo.includes(signatureImage)) {
    console.log('✍️ Assinatura já presente no conteúdo');
    return conteudo;
  }
  
  const assinaturaHTML = `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <img src="${signatureImage}" style="max-width: 200px; height: auto;" alt="Assinatura Digital" />
  </div>`;
  
  const conteudoComAssinatura = conteudo + assinaturaHTML;
  console.log('✍️ Assinatura injetada com sucesso');
  
  return conteudoComAssinatura;
}

// Função para processar anexos
function processAttachments(templateAttachments: any): any[] {
  if (!templateAttachments) return [];
  
  console.log('📎 Processando anexos:', templateAttachments);
  
  try {
    let attachmentsArray: any[] = [];
    
    if (Array.isArray(templateAttachments)) {
      attachmentsArray = templateAttachments;
    } else if (typeof templateAttachments === 'string') {
      try {
        attachmentsArray = JSON.parse(templateAttachments);
      } catch (e) {
        console.log('📎 Anexos não são JSON válido, tratando como string única');
        attachmentsArray = [{ filename: 'anexo', content: templateAttachments }];
      }
    } else {
      attachmentsArray = [templateAttachments];
    }
    
    const nodemailerAttachments = attachmentsArray.map((attachment, index) => {
      if (typeof attachment === 'string') {
        return {
          filename: `anexo_${index + 1}.txt`,
          content: attachment
        };
      }
      
      return {
        filename: attachment.filename || `anexo_${index + 1}`,
        content: attachment.content || attachment.data || '',
        contentType: attachment.contentType || attachment.type
      };
    });
    
    console.log('📎 Anexos processados para nodemailer:', nodemailerAttachments);
    return nodemailerAttachments;
    
  } catch (error) {
    console.error('❌ Erro ao processar anexos:', error);
    return [];
  }
}

// Função principal para enviar email via SMTP - CORRIGIDA
async function enviarEmailSMTP(email: any, smtp: any): Promise<boolean> {
  try {
    console.log(`📧 Configurando SMTP para ${email.to}`);
    console.log(`🔧 SMTP Config:`, {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      user: smtp.username || smtp.from_email
    });

    // CORREÇÃO CRÍTICA: createTransport ao invés de createTransporter
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.username || smtp.from_email,
        pass: smtp.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexão SMTP
    try {
      await transporter.verify();
      console.log('✅ Conexão SMTP verificada com sucesso');
    } catch (verifyError) {
      console.error('❌ Erro na verificação SMTP:', verifyError);
      throw new Error(`Falha na conexão SMTP: ${verifyError.message}`);
    }

    // Processar o conteúdo do email com substituição de variáveis
    let processedContent = email.content || email.html || '';
    let processedSubject = email.subject || '';
    
    if (email.contact) {
      console.log(`🔄 Substituindo variáveis para contato:`, email.contact.nome || email.contact.name);
      processedContent = substituirVariaveis(processedContent, email.contact);
      processedSubject = substituirVariaveis(processedSubject, email.contact);
    }
    
    // Injetar imagem de URL se existir
    if (email.image_url) {
      console.log('🖼️ Injetando imagem de URL:', email.image_url);
      processedContent = injetarImagensUrl(processedContent, email.image_url);
    }
    
    // Injetar assinatura digital automaticamente
    if (email.signature_image) {
      console.log('✍️ Injetando assinatura digital:', email.signature_image);
      processedContent = injetarAssinaturaDigital(processedContent, email.signature_image);
    }
    
    // Processar anexos se existirem
    let processedAttachments: any[] = [];
    if (email.attachments) {
      console.log('📎 Processando anexos:', email.attachments);
      processedAttachments = processAttachments(email.attachments);
    }
    
    const mailOptions = {
      from: `"${smtp.from_name}" <${smtp.from_email}>`,
      to: email.to,
      subject: processedSubject,
      html: processedContent,
      attachments: processedAttachments
    };

    console.log('📧 Enviando email com configurações:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      attachments_count: processedAttachments.length,
      has_signature: !!email.signature_image,
      has_image_url: !!email.image_url,
      content_length: processedContent.length,
      from: mailOptions.from
    });

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado com sucesso para ${email.to}:`, info.messageId);
    if (processedAttachments.length > 0) {
      console.log(`📎 ${processedAttachments.length} anexo(s) enviado(s) com sucesso`);
    }
    
    return info.accepted && info.accepted.length > 0;
  } catch (error: any) {
    console.error(`❌ Erro ao enviar email via SMTP para ${email.to}:`, error);
    console.error(`❌ Detalhes do erro:`, {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
}

// Função para processar envio individual
async function processSingleEmail(emailData: any, smtpSettings: any): Promise<any> {
  try {
    console.log(`📧 Processando envio individual para: ${emailData.to}`);
    
    // Validar dados obrigatórios
    if (!emailData.to || !emailData.subject || !emailData.content) {
      throw new Error('Dados obrigatórios faltando: to, subject, content');
    }

    // Preparar configurações SMTP
    const smtpConfig = {
      host: smtpSettings.host,
      port: parseInt(smtpSettings.port) || 587,
      secure: smtpSettings.port === 465 || smtpSettings.secure === true,
      password: smtpSettings.password,
      from_name: smtpSettings.from_name || 'Sistema Email',
      from_email: smtpSettings.from_email || smtpSettings.username || '',
      username: smtpSettings.username || smtpSettings.from_email || ''
    };

    console.log('🔧 Configurações SMTP finais:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      from: smtpConfig.from_email
    });

    // Enviar email
    const success = await enviarEmailSMTP(emailData, smtpConfig);
    
    if (success) {
      console.log(`✅ Email enviado com sucesso para: ${emailData.to}`);
      
      // Salvar no histórico de envios
      try {
        const historyData = {
          user_id: emailData.user_id || '00000000-0000-0000-0000-000000000000',
          template_id: emailData.template_id || null,
          contato_id: emailData.contato_id || null,
          remetente_nome: smtpConfig.from_name || 'Sistema Email',
          remetente_email: smtpConfig.from_email || 'sistema@email.com',
          destinatario_nome: emailData.contato_nome || emailData.contact?.nome || emailData.contact?.name || 'Destinatário',
          destinatario_email: emailData.to || 'destinatario@email.com',
          status: 'enviado',
          tipo_envio: 'envio_imediato',
          mensagem_erro: null
        };
        
        console.log('📝 Dados do histórico:', historyData);
        
        const { error: historyError } = await supabase
          .from('envios_historico')
          .insert([historyData]);
        
        if (historyError) {
          console.error('⚠️ Erro ao salvar no histórico:', historyError);
          throw historyError;
        }
        
        console.log('📝 Registro salvo no histórico com sucesso');
      } catch (historyError) {
        console.error('⚠️ Erro ao salvar no histórico:', historyError);
        // Não falhar o envio por causa do histórico
      }
      
      return {
        success: true,
        message: "Email enviado com sucesso!",
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
        details: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          from: smtpConfig.from_email
        }
      };
    } else {
      throw new Error('Falha ao enviar email via SMTP');
    }

  } catch (error: any) {
    console.error(`❌ Erro ao processar email para ${emailData.to}:`, error);
    
    return {
      success: false,
      error: error.message,
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    };
  }
}

serve(async (req) => {
  console.log(`📡 Requisição recebida: ${req.method} para ${req.url}`);
  
  // Handle CORS preflight requests - CORRIGIDO DEFINITIVAMENTE
  if (req.method === 'OPTIONS') {
    console.log("✅ Respondendo a requisição OPTIONS com CORS - STATUS 200");
    return new Response(null, { 
      status: 200,
      statusText: 'OK',
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
          statusText: 'Bad Request',
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

      // Processar cada email do lote com delay para evitar rate limiting
      for (let i = 0; i < requestData.emails.length; i++) {
        const emailData = requestData.emails[i];
        try {
          console.log(`📧 Processando email ${i + 1}/${requestData.emails.length} para: ${emailData.to}`);
          
          const result = await processSingleEmail(emailData, requestData.smtp_settings);
          results.push(result);
          
          if (result.success) {
            successCount++;
          } else {
            failedCount++;
          }
          
          // Delay entre emails para evitar rate limiting
          if (i < requestData.emails.length - 1) {
            await delay(1000); // 1 segundo entre emails
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
          statusText: 'OK',
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

    // Processar envio individual
    const result = await processSingleEmail(emailData, requestData.smtp_settings);
    
    console.log("📧 Resultado do envio individual:", result);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500,
        statusText: result.success ? 'OK' : 'Internal Server Error',
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
        statusText: 'Internal Server Error',
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
