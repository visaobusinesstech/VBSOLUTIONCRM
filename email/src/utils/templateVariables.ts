
/**
 * Utilitário para substituição de variáveis dinâmicas em templates de email
 * Processa variáveis como {nome}, {email}, etc. com dados reais dos contatos
 */

interface ContactData {
  nome?: string;
  email?: string;
  telefone?: string;
  cliente?: string;
  razao_social?: string;
  endereco?: string;
  cargo?: string;
  empresa?: string;
  produto?: string;
  valor?: string;
  vencimento?: string;
  [key: string]: any;
}

/**
 * Substitui variáveis dinâmicas no conteúdo do template
 * @param content - Conteúdo HTML do template
 * @param contactData - Dados do contato para substituição
 * @returns Conteúdo com variáveis substituídas
 */
export function replaceTemplateVariables(content: string, contactData: ContactData): string {
  if (!content || !contactData) {
    return content;
  }

  let processedContent = content;

  // Data e hora atuais
  const now = new Date();
  const currentDate = now.toLocaleDateString('pt-BR');
  const currentTime = now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Mapeamento de variáveis disponíveis
  const variableMap: Record<string, string> = {
    '{nome}': contactData.nome || '',
    '{cliente}': contactData.cliente || contactData.nome || '',
    '{email}': contactData.email || '',
    '{telefone}': contactData.telefone || '',
    '{razao_social}': contactData.razao_social || '',
    '{endereco}': contactData.endereco || '',
    '{cargo}': contactData.cargo || '',
    '{empresa}': contactData.empresa || contactData.cliente || '',
    '{produto}': contactData.produto || '',
    '{valor}': contactData.valor || '',
    '{vencimento}': contactData.vencimento || '',
    '{data}': currentDate,
    '{hora}': currentTime
  };

  // Substituir cada variável encontrada
  Object.entries(variableMap).forEach(([variable, value]) => {
    // Usar regex global para substituir todas as ocorrências
    const regex = new RegExp(escapeRegExp(variable), 'gi');
    processedContent = processedContent.replace(regex, value);
  });

  // Log para debug (apenas em desenvolvimento)
  console.log('Template variables processed:', {
    originalVariables: Object.keys(variableMap).filter(key => content.includes(key)),
    contactData: contactData,
    hasReplacements: processedContent !== content
  });

  return processedContent;
}

/**
 * Escapa caracteres especiais para uso em regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extrai todas as variáveis presentes no conteúdo do template
 * @param content - Conteúdo do template
 * @returns Array com as variáveis encontradas
 */
export function extractTemplateVariables(content: string): string[] {
  if (!content) return [];
  
  const variableRegex = /\{[^}]+\}/g;
  const matches = content.match(variableRegex);
  
  return matches ? [...new Set(matches)] : [];
}

/**
 * Valida se todas as variáveis necessárias estão disponíveis nos dados do contato
 * @param content - Conteúdo do template
 * @param contactData - Dados do contato
 * @returns Objeto com status da validação e variáveis faltantes
 */
export function validateTemplateVariables(content: string, contactData: ContactData) {
  const variables = extractTemplateVariables(content);
  const availableVariables = [
    '{nome}', '{cliente}', '{email}', '{telefone}', '{razao_social}',
    '{endereco}', '{cargo}', '{empresa}', '{produto}', '{valor}',
    '{vencimento}', '{data}', '{hora}'
  ];
  
  const missingVariables = variables.filter(variable => 
    !availableVariables.includes(variable.toLowerCase())
  );
  
  const emptyVariables = variables.filter(variable => {
    const key = variable.replace(/[{}]/g, '').toLowerCase();
    return availableVariables.includes(`{${key}}`) && !contactData[key];
  });
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    emptyVariables,
    totalVariables: variables.length
  };
}
