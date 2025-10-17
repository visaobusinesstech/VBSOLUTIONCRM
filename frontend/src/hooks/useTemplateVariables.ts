import { useCallback } from 'react';

export interface ContactData {
  id: string;
  name?: string;
  fantasy_name?: string;
  email: string;
  telefone?: string;
  razao_social?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  [key: string]: any;
}

export function useTemplateVariables() {
  const processTemplateVariables = useCallback((content: string, contactData: ContactData): string => {
    if (!content || !contactData) return content;

    let processedContent = content;

    // Variáveis básicas do contato
    const variables: { [key: string]: string } = {
      '{nome}': contactData.name || contactData.fantasy_name || 'Cliente',
      '{email}': contactData.email || '',
      '{telefone}': contactData.telefone || '',
      '{razao_social}': contactData.razao_social || '',
      '{fantasia}': contactData.fantasy_name || contactData.name || 'Cliente',
      '{endereco}': contactData.endereco || '',
      '{cidade}': contactData.cidade || '',
      '{estado}': contactData.estado || '',
      '{cep}': contactData.cep || '',
      
      // Variáveis do sistema
      '{data_atual}': new Date().toLocaleDateString('pt-BR'),
      '{hora_atual}': new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      '{data_completa}': new Date().toLocaleString('pt-BR'),
      '{ano}': new Date().getFullYear().toString(),
      '{mes}': (new Date().getMonth() + 1).toString().padStart(2, '0'),
      '{dia}': new Date().getDate().toString().padStart(2, '0'),
      
      // Variáveis de saudação
      '{saudacao}': getSaudacao(),
      '{saudacao_nome}': `${getSaudacao()} ${contactData.name || contactData.fantasy_name || 'Cliente'}`,
    };

    // Substituir todas as variáveis
    Object.entries(variables).forEach(([variable, value]) => {
      const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'gi');
      processedContent = processedContent.replace(regex, value);
    });

    // Processar variáveis dinâmicas do contato
    Object.entries(contactData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const variable = `{${key}}`;
        const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'gi');
        processedContent = processedContent.replace(regex, value);
      }
    });

    return processedContent;
  }, []);

  const processSubjectVariables = useCallback((subject: string, contactData: ContactData): string => {
    return processTemplateVariables(subject, contactData);
  }, [processTemplateVariables]);

  const getAvailableVariables = useCallback((): string[] => {
    return [
      '{nome}', '{email}', '{telefone}', '{razao_social}', '{fantasia}',
      '{endereco}', '{cidade}', '{estado}', '{cep}',
      '{data_atual}', '{hora_atual}', '{data_completa}', '{ano}', '{mes}', '{dia}',
      '{saudacao}', '{saudacao_nome}'
    ];
  }, []);

  const validateTemplate = useCallback((content: string): { isValid: boolean; missingVariables: string[] } => {
    const availableVariables = getAvailableVariables();
    const usedVariables = content.match(/\{[^}]+\}/g) || [];
    const missingVariables = usedVariables.filter(variable => 
      !availableVariables.includes(variable) && 
      !variable.match(/^\{[a-z_]+\}$/i) // Variáveis dinâmicas do contato
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }, [getAvailableVariables]);

  return {
    processTemplateVariables,
    processSubjectVariables,
    getAvailableVariables,
    validateTemplate
  };
}

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
