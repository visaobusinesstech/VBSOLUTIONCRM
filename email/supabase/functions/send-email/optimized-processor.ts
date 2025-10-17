
// Processador otimizado para envio em lote com SMTP real do usuário
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import nodemailer from 'npm:nodemailer';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função de delay local
export function delay(ms: number): Promise<void> {
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

// CORREÇÃO: Função para substituir variáveis no conteúdo do template - FORMATO UNIFICADO
function substituirVariaveis(conteudo: string, contato: any): string {
  if (!conteudo) return '';
  
  console.log('🔄 Substituindo variáveis para:', contato?.nome || contato?.email);
  console.log('🔄 Conteúdo original:', conteudo.substring(0, 200) + '...');
  
  // NOVO FORMATO UNIFICADO: usar apenas chaves simples {variavel}
  const variaveis: Record<string, string> = {
    '{nome}': contato?.nome || '',
    '{email}': contato?.email || '',
    '{telefone}': contato?.telefone || '',
    '{razao_social}': contato?.razao_social || '',
    '{cliente}': contato?.cliente || contato?.nome || '',
    '{empresa}': contato?.razao_social || contato?.empresa || 'Empresa',
    '{endereco}': contato?.endereco || '',
    '{cargo}': contato?.cargo || '',
    '{produto}': contato?.produto || '',
    '{valor}': contato?.valor || '',
    '{vencimento}': contato?.vencimento || '',
    '{data}': getDataHoje(),
    '{hora}': getHoraAtual()
  };
  
  let conteudoProcessado = conteudo;
  
  // Substituir cada variável pelo valor correspondente usando regex global
  Object.entries(variaveis).forEach(([variavel, valor]) => {
    // Escapar caracteres especiais da variável para regex
    const variavelEscapada = variavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(variavelEscapada, 'gi');
    conteudoProcessado = conteudoProcessado.replace(regex, valor);
  });
  
  // Log para debug
  const variaveisEncontradas = Object.keys(variaveis).filter(v => conteudo.includes(v));
  console.log('🔄 Variáveis encontradas no conteúdo:', variaveisEncontradas);
  console.log('🔄 Conteúdo após substituição:', conteudoProcessado.substring(0, 200) + '...');
  console.log('🔄 Substituição realizada:', conteudoProcessado !== conteudo);
  
  return conteudoProcessado;
}

// NOVA FUNÇÃO: Injetar imagens de URL no conteúdo HTML
function injetarImagensUrl(conteudo: string, imageUrl: string | null): string {
  if (!imageUrl) return conteudo;
  
  console.log('🖼️ Injetando imagem de URL no conteúdo:', imageUrl);
  
  // Se o conteúdo já contém a imagem, não fazer nada
  if (conteudo.includes(imageUrl)) {
    console.log('🖼️ Imagem já presente no conteúdo');
    return conteudo;
  }
  
  // Criar tag de imagem HTML
  const imagemHTML = `<div style="text-align: center; margin: 20px 0;">
    <img src="${imageUrl}" style="max-width: 100%; height: auto;" alt="Imagem do Template" />
  </div>`;
  
  // Injetar a imagem no início do conteúdo, após qualquer tag <p> de abertura
  let conteudoComImagem = conteudo;
  
  // Tentar injetar após primeiro parágrafo se existir
  const primeiroParagrafo = conteudo.match(/<p[^>]*>.*?<\/p>/i);
  if (primeiroParagrafo) {
    conteudoComImagem = conteudo.replace(primeiroParagrafo[0], primeiroParagrafo[0] + imagemHTML);
  } else {
    // Se não há parágrafo, injetar no início
    conteudoComImagem = imagemHTML + conteudo;
  }
  
  console.log('🖼️ Imagem de URL injetada com sucesso');
  return conteudoComImagem;
}

// Função para injetar assinatura digital automaticamente
function injetarAssinaturaDigital(conteudo: string, signatureImage: string | null): string {
  if (!signatureImage) return conteudo;
  
  const assinaturaHTML = `
  <div style="margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
    <div style="text-align: right;">
      <img src="${signatureImage}" style="max-width: 200px; height: auto;" alt="Assinatura Digital" />
    </div>
  </div>`;
  
  // Injetar assinatura no final do conteúdo HTML
  return conteudo + assinaturaHTML;
}

// Função para processar anexos do template para formato do nodemailer - MELHORADA
function processAttachments(templateAttachments: any): any[] {
  if (!templateAttachments) {
    console.log('📎 Nenhum anexo encontrado no template');
    return [];
  }

  console.log('📎 Processando anexos do template:', templateAttachments);
  console.log('📎 Tipo dos anexos:', typeof templateAttachments);
  
  let attachments = [];
  
  // CORREÇÃO: Lidar com diferentes formatos de entrada
  try {
    // Se for uma string, tentar fazer parse como JSON
    if (typeof templateAttachments === 'string') {
      console.log('📎 Anexos em formato string, fazendo parse JSON...');
      const parsed = JSON.parse(templateAttachments);
      if (Array.isArray(parsed)) {
        attachments = parsed;
      } else {
        attachments = [parsed];
      }
    } 
    // Se for um array
    else if (Array.isArray(templateAttachments)) {
      console.log('📎 Anexos já em formato de array');
      attachments = templateAttachments;
    } 
    // Se for um objeto único
    else if (typeof templateAttachments === 'object') {
      console.log('📎 Anexo em formato de objeto único');
      attachments = [templateAttachments];
    }
    else {
      console.log('📎 Formato de anexo não reconhecido:', templateAttachments);
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao processar anexos:', error);
    return [];
  }

  console.log('📎 Anexos depois do parse:', attachments);

  // Converter para formato do nodemailer
  const nodemailerAttachments = attachments.map((attachment: any, index: number) => {
    console.log(`📎 Convertendo anexo ${index + 1}:`, attachment);
    
    // Formato esperado pelo nodemailer: { filename, path, contentType? }
    let converted: any = {};
    
    // Tentar diferentes formatos de dados
    if (attachment.filename && attachment.path) {
      // Já está no formato correto
      converted = {
        filename: attachment.filename,
        path: attachment.path,
        contentType: attachment.contentType || attachment.content_type
      };
    } else if (attachment.name && attachment.url) {
      // Formato alternativo comum
      converted = {
        filename: attachment.name,
        path: attachment.url,
        contentType: attachment.contentType || attachment.content_type || attachment.type
      };
    } else if (attachment.file_name && attachment.file_url) {
      // Outro formato possível
      converted = {
        filename: attachment.file_name,
        path: attachment.file_url,
        contentType: attachment.content_type || attachment.type
      };
    } else if (typeof attachment === 'string') {
      // Se for apenas uma URL
      const filename = attachment.split('/').pop() || `attachment_${index + 1}`;
      converted = {
        filename: filename,
        path: attachment
      };
    } else {
      console.warn(`⚠️ Formato de anexo não reconhecido para anexo ${index + 1}:`, attachment);
      return null;
    }

    // Validar se temos os campos obrigatórios
    if (!converted.filename || !converted.path) {
      console.error(`❌ Anexo ${index + 1} inválido - faltando filename ou path:`, converted);
      return null;
    }

    // Determinar contentType se não estiver definido
    if (!converted.contentType && converted.filename) {
      const extension = converted.filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed'
      };
      converted.contentType = mimeTypes[extension] || 'application/octet-stream';
    }

    console.log(`✅ Anexo ${index + 1} convertido:`, converted);
    return converted;
  }).filter(Boolean); // Remove anexos nulos

  console.log(`📎 Total de anexos processados: ${nodemailerAttachments.length}`);
  return nodemailerAttachments;
}

// CORREÇÃO CRÍTICA: Usar createTransport ao invés de createTransporter
async function enviarEmailSMTP(email: any, smtp: any): Promise<boolean> {
  try {
    // CORREÇÃO: nodemailer.createTransport (não createTransporter)
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

    console.log(`📧 Enviando email real via SMTP para ${email.to}`);
    console.log(`🔧 Configurações SMTP:`, {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      user: smtp.username || smtp.from_email
    });
    
    // Processar o conteúdo do email com substituição de variáveis
    let processedContent = email.content || email.html || '';
    let processedSubject = email.subject || '';
    
    if (email.contact) {
      console.log(`🔄 Substituindo variáveis para contato:`, email.contact.nome);
      processedContent = substituirVariaveis(processedContent, email.contact);
      processedSubject = substituirVariaveis(processedSubject, email.contact);
    }
    
    // NOVA CORREÇÃO: Injetar imagem de URL se existir
    if (email.image_url) {
      console.log('🖼️ Injetando imagem de URL:', email.image_url);
      processedContent = injetarImagensUrl(processedContent, email.image_url);
    } else {
      console.log('🖼️ Nenhuma imagem de URL encontrada');
    }
    
    // CORREÇÃO: Injetar assinatura digital automaticamente
    if (email.signature_image) {
      console.log('✍️ Injetando assinatura digital:', email.signature_image);
      processedContent = injetarAssinaturaDigital(processedContent, email.signature_image);
    } else {
      console.log('✍️ Nenhuma assinatura digital encontrada');
    }
    
    // CORREÇÃO: Processar anexos se existirem
    let processedAttachments: any[] = [];
    if (email.attachments) {
      console.log('📎 Anexos brutos recebidos:', email.attachments);
      console.log('📎 Tipo dos anexos recebidos:', typeof email.attachments);
      processedAttachments = processAttachments(email.attachments);
      console.log('📎 Anexos processados para nodemailer:', processedAttachments);
    } else {
      console.log('📎 Nenhum anexo encontrado no email');
    }
    
    const mailOptions = {
      from: `"${smtp.from_name}" <${smtp.from_email}>`,
      to: email.to,
      subject: processedSubject,
      html: processedContent,
      attachments: processedAttachments
    };

    console.log('📧 Configurações finais do email:', {
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
    if (email.signature_image) {
      console.log(`✍️ Assinatura digital incluída com sucesso`);
    }
    if (email.image_url) {
      console.log(`🖼️ Imagem de URL incluída com sucesso`);
    }
    return info.accepted && info.accepted.length > 0;
  } catch (error: any) {
    console.error(`❌ Erro ao enviar email via SMTP para ${email.to}:`, error);
    console.error(`❌ Detalhes do erro:`, {
      message: error.message,
      code: error.code,
      command: error.command
    });
    if (error.message?.includes('attachment')) {
      console.error('❌ Erro específico de anexo:', error.message);
    }
    return false;
  }
}

// NOVO: Processamento de envio único COMPLETO - CORRIGIDO
export async function processSingleSend(email: any, smtp_settings: any): Promise<any> {
  try {
    console.log(`📧 Processando envio único para ${email.to}`);
    console.log(`📋 Dados recebidos:`, {
      to: email.to,
      subject: email.subject,
      contato_id: email.contato_id,
      template_id: email.template_id,
      user_id: email.user_id,
      has_content: !!email.content,
      has_attachments: !!email.attachments,
      has_signature: !!email.signature_image,
      has_image_url: !!email.image_url
    });
    
    // Buscar dados completos do usuário se não tiver user_id
    let user_id = email.user_id;
    if (!user_id && email.contato_id) {
      console.log('🔍 Buscando user_id via contato_id:', email.contato_id);
      const { data: contato } = await supabase
        .from('contatos')
        .select('user_id')
        .eq('id', email.contato_id)
        .single();
      
      if (contato) {
        user_id = contato.user_id;
        console.log('✅ user_id encontrado via contato:', user_id);
      }
    }

    // CORREÇÃO: Buscar assinatura digital das configurações se não estiver no email
    let signature_image = email.signature_image;
    if (!signature_image && user_id) {
      console.log('🔍 Buscando assinatura digital nas configurações do usuário');
      const { data: userSettings } = await supabase
        .from('configuracoes')
        .select('signature_image')
        .eq('user_id', user_id)
        .single();
      
      if (userSettings?.signature_image) {
        signature_image = userSettings.signature_image;
        console.log('✅ Assinatura digital encontrada nas configurações:', signature_image);
      }
    }

    // CORREÇÃO: Buscar anexos e image_url do template se não estiverem no email
    let attachments = email.attachments;
    let image_url = email.image_url;
    
    if ((!attachments || !image_url) && email.template_id) {
      console.log('🔍 Buscando dados completos do template:', email.template_id);
      const { data: templateData } = await supabase
        .from('templates')
        .select('attachments, image_url')
        .eq('id', email.template_id)
        .single();
      
      if (templateData) {
        if (!attachments && templateData.attachments) {
          attachments = templateData.attachments;
          console.log('✅ Anexos encontrados no template:', attachments);
        }
        if (!image_url && templateData.image_url) {
          image_url = templateData.image_url;
          console.log('✅ Image URL encontrada no template:', image_url);
        }
      }
    }

    // Montar email completo com todos os dados
    const emailCompleto = {
      ...email,
      signature_image: signature_image,
      attachments: attachments,
      image_url: image_url,
      user_id: user_id,
      smtp_settings: smtp_settings
    };

    console.log(`📧 Email completo preparado:`, {
      to: emailCompleto.to,
      has_signature: !!emailCompleto.signature_image,
      has_attachments: !!emailCompleto.attachments,
      has_image_url: !!emailCompleto.image_url,
      user_id: emailCompleto.user_id
    });
    
    const success = await enviarEmailSMTP(emailCompleto, smtp_settings);

    if (success) {
      console.log(`✅ Envio único bem-sucedido para ${email.to}`);
      await registerInHistory(emailCompleto, 'enviado', null);
      return { 
        success: true,
        message: `Email enviado com sucesso para ${email.to}`,
        method: 'SMTP'
      };
    } else {
      console.log(`❌ Envio único falhou para ${email.to}`);
      await registerInHistory(emailCompleto, 'erro', 'Falha no envio SMTP');
      return { 
        success: false, 
        error: 'Falha no envio SMTP' 
      };
    }
  } catch (err: any) {
    console.error('❌ Erro crítico no envio único:', err);
    console.error('❌ Stack trace:', err.stack);
    await registerInHistory(email, 'erro', err.message);
    return { 
      success: false, 
      error: err.message 
    };
  }
}

// ... keep existing code (processOptimizedBatch function)
export async function processOptimizedBatch(data: any): Promise<any> {
  const { emails, smtp_settings, optimization_config } = data;
  
  if (!emails || emails.length === 0) {
    return {
      success: false,
      error: "Nenhum email para processar"
    };
  }

  if (!smtp_settings || !smtp_settings.host) {
    return {
      success: false,
      error: "Configurações SMTP são obrigatórias"
    };
  }

  console.log(`🚀 SISTEMA SMTP REAL iniciado para ${emails.length} emails`);
  console.log(`📧 SMTP: ${smtp_settings.host}:${smtp_settings.port}`);
  
  // Verificar se todos os emails têm os dados necessários
  const emailsComDados = emails.filter((email: any) => email.to && email.content);
  console.log(`📋 Emails válidos para envio: ${emailsComDados.length}/${emails.length}`);
  
  // Log de anexos e imagens
  const emailsComAnexos = emails.filter((email: any) => email.attachments);
  const emailsComImagens = emails.filter((email: any) => email.image_url);
  console.log(`📎 Emails com anexos: ${emailsComAnexos.length}`);
  console.log(`🖼️ Emails com imagens URL: ${emailsComImagens.length}`);
  
  // Detectar provedor baseado no host SMTP
  const isGmail = smtp_settings.host?.includes('gmail');
  const isOutlook = smtp_settings.host?.includes('outlook') || smtp_settings.host?.includes('live');
  const isYahoo = smtp_settings.host?.includes('yahoo');
  
  // Configurações otimizadas por provedor
  const providerConfigs = {
    gmail: {
      rateLimitPerMinute: 15,
      burstLimit: 5,
      baseDelay: 3000,
      maxConcurrent: 2,
      successRateTarget: "98.0%"
    },
    outlook: {
      rateLimitPerMinute: 20,
      burstLimit: 8,
      baseDelay: 2000,
      maxConcurrent: 3,
      successRateTarget: "97.0%"
    },
    yahoo: {
      rateLimitPerMinute: 18,
      burstLimit: 6,
      baseDelay: 2500,
      maxConcurrent: 2,
      successRateTarget: "96.0%"
    },
    other: {
      rateLimitPerMinute: 25,
      burstLimit: 10,
      baseDelay: 1500,
      maxConcurrent: 5,
      successRateTarget: "95.0%"
    }
  };

  const provider = isGmail ? 'gmail' : isOutlook ? 'outlook' : isYahoo ? 'yahoo' : 'other';
  const config = providerConfigs[provider];
  
  console.log(`⚙️ Configuração ${provider.charAt(0).toUpperCase() + provider.slice(1)}:`, {
    rateLimitPerMinute: config.rateLimitPerMinute,
    burstLimit: config.burstLimit,
    baseDelay: config.baseDelay,
    maxConcurrent: config.maxConcurrent,
    successRateTarget: config.successRateTarget
  });

  const results: any[] = [];
  const startTime = Date.now();
  
  // Processamento em lotes paralelos com SMTP real
  const batchSize = config.maxConcurrent;
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < emailsComDados.length; i += batchSize) {
    const batch = emailsComDados.slice(i, i + batchSize);
    console.log(`📦 Processando lote ${Math.floor(i / batchSize) + 1} com ${batch.length} emails via SMTP`);
    
    // Processar lote em paralelo usando SMTP real
    const batchPromises = batch.map(async (email: any, index: number) => {
      const emailIndex = i + index;
      try {
        console.log(`📧 [${emailIndex + 1}/${emailsComDados.length}] Enviando via SMTP para ${email.to}`);
        
        // Log de anexos e assinatura se existirem
        if (email.attachments) {
          console.log(`📎 [${emailIndex + 1}/${emailsComDados.length}] Email tem anexos:`, email.attachments);
        }
        if (email.signature_image) {
          console.log(`✍️ [${emailIndex + 1}/${emailsComDados.length}] Email tem assinatura digital`);
        }
        if (email.image_url) {
          console.log(`🖼️ [${emailIndex + 1}/${emailsComDados.length}] Email tem imagem URL:`, email.image_url);
        }
        
        // Adicionar configurações SMTP ao email
        const emailWithSmtp = {
          ...email,
          smtp_settings: smtp_settings
        };
        
        // Envio real via SMTP
        const success = await enviarEmailSMTP(emailWithSmtp, smtp_settings);
        
        if (success) {
          successCount++;
          console.log(`✅ [${emailIndex + 1}/${emailsComDados.length}] SMTP sucesso para ${email.to}`);
          
          // Registrar no histórico
          await registerInHistory(emailWithSmtp, 'enviado', null);
          
          return {
            email: email.to,
            success: true,
            index: emailIndex,
            method: 'SMTP'
          };
        } else {
          failureCount++;
          const error = "Falha no envio SMTP";
          console.log(`❌ [${emailIndex + 1}/${emailsComDados.length}] SMTP falha para ${email.to}: ${error}`);
          
          // Registrar no histórico
          await registerInHistory(emailWithSmtp, 'erro', error);
          
          return {
            email: email.to,
            success: false,
            error,
            index: emailIndex,
            method: 'SMTP'
          };
        }
      } catch (error: any) {
        failureCount++;
        console.error(`💥 [${emailIndex + 1}/${emailsComDados.length}] Erro SMTP crítico para ${email.to}:`, error);
        
        // Registrar no histórico
        const emailWithSmtp = { ...email, smtp_settings: smtp_settings };
        await registerInHistory(emailWithSmtp, 'erro', error.message);
        
        return {
          email: email.to,
          success: false,
          error: error.message,
          index: emailIndex,
          method: 'SMTP'
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay entre lotes
    if (i + batchSize < emailsComDados.length) {
      console.log(`⏱️ Aguardando ${config.baseDelay}ms antes do próximo lote SMTP...`);
      await delay(config.baseDelay);
    }
  }

  const totalDuration = (Date.now() - startTime) / 1000;
  const successRate = ((successCount / emailsComDados.length) * 100).toFixed(1) + '%';
  const avgThroughput = (successCount / totalDuration).toFixed(2);

  console.log(`🎯 RESUMO FINAL SMTP:
    • Total processados: ${emailsComDados.length}
    • Sucessos: ${successCount}
    • Falhas: ${failureCount}
    • Taxa de sucesso: ${successRate}
    • Duração: ${totalDuration.toFixed(1)}s
    • Throughput: ${avgThroughput} emails/s
    • Provedor SMTP: ${provider.charAt(0).toUpperCase() + provider.slice(1)}
    • Host: ${smtp_settings.host}
    • Emails com anexos: ${emailsComAnexos.length}
    • Emails com imagens URL: ${emailsComImagens.length}
  `);

  return {
    success: successCount > 0,
    summary: {
      total: emailsComDados.length,
      successful: successCount,
      failed: failureCount,
      successRate,
      totalDuration: parseFloat(totalDuration.toFixed(1)),
      avgThroughput: parseFloat(avgThroughput),
      provider: provider,
      method: 'SMTP',
      host: smtp_settings.host,
      attachmentsProcessed: emailsComAnexos.length,
      imagesProcessed: emailsComImagens.length
    },
    results
  };
}

// CORREÇÃO: Registro no histórico com validação completa e fallback para user_id
async function registerInHistory(email: any, status: 'enviado' | 'erro', errorMessage?: string | null) {
  try {
    // Buscar user_id através de múltiplas fontes
    let user_id = email.contact?.user_id || email.user_id;
    
    // Se não conseguiu user_id do email, tentar buscar via contato_id
    if (!user_id && email.contato_id) {
      console.log('🔍 Buscando user_id via contato_id:', email.contato_id);
      const { data: contato } = await supabase
        .from('contatos')
        .select('user_id')
        .eq('id', email.contato_id)
        .single();
      
      if (contato) {
        user_id = contato.user_id;
        console.log('✅ user_id encontrado via contato:', user_id);
      }
    }
    
    // Se ainda não tem user_id, tentar buscar via template_id
    if (!user_id && email.template_id) {
      console.log('🔍 Buscando user_id via template_id:', email.template_id);
      const { data: template } = await supabase
        .from('templates')
        .select('user_id')
        .eq('id', email.template_id)
        .single();
      
      if (template) {
        user_id = template.user_id;
        console.log('✅ user_id encontrado via template:', user_id);
      }
    }
    
    if (!user_id) {
      console.error('❌ Não foi possível determinar user_id para registrar histórico');
      return;
    }

    // Validar status
    if (!['enviado', 'erro'].includes(status)) {
      console.error('❌ Status inválido para histórico:', status);
      return;
    }

    const historyRecord = {
      template_id: email.template_id || null,
      contato_id: email.contato_id || null,
      remetente_nome: email.smtp_settings?.from_name || 'Sistema',
      remetente_email: email.smtp_settings?.from_email || '',
      destinatario_nome: email.contato_nome || email.contact?.nome || 'Destinatário',
      destinatario_email: email.to,
      status: status,
      template_nome: email.subject || 'Email',
      tipo_envio: 'imediato',
      mensagem_erro: errorMessage,
      user_id: user_id,
      data_envio: new Date().toISOString()
    };

    console.log('📝 Registrando histórico:', {
      user_id: historyRecord.user_id,
      status: historyRecord.status,
      tipo_envio: historyRecord.tipo_envio,
      email: historyRecord.destinatario_email
    });

    const { error } = await supabase
      .from('envios_historico')
      .insert([historyRecord]);

    if (error) {
      console.error('❌ Erro ao registrar histórico:', error);
    } else {
      console.log(`📝 Histórico SMTP registrado: ${email.to} - ${status}`);
    }
  } catch (error) {
    console.error('❌ Erro crítico ao registrar histórico:', error);
  }
}
