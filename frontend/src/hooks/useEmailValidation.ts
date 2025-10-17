import { useState, useCallback } from 'react';

interface ValidationProgress {
  current: number;
  total: number;
  percentage: number;
  isValidating: boolean;
}

export function useEmailValidation() {
  const [validationProgress, setValidationProgress] = useState<ValidationProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    isValidating: false
  });

  const validateEmail = useCallback((email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const validateEmails = useCallback(async (emails: string[]): Promise<{
    valid: string[];
    invalid: string[];
    duplicates: string[];
  }> => {
    const valid: string[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    const duplicates: string[] = [];

    setValidationProgress({
      current: 0,
      total: emails.length,
      percentage: 0,
      isValidating: true
    });

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i].trim().toLowerCase();
      
      // Verificar duplicatas
      if (seen.has(email)) {
        duplicates.push(email);
      } else {
        seen.add(email);
        
        // Validar formato
        if (validateEmail(email)) {
          valid.push(email);
        } else {
          invalid.push(email);
        }
      }

      // Atualizar progresso
      const percentage = Math.round(((i + 1) / emails.length) * 100);
      setValidationProgress({
        current: i + 1,
        total: emails.length,
        percentage,
        isValidating: true
      });

      // Pequeno delay para não sobrecarregar
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    setValidationProgress(prev => ({
      ...prev,
      isValidating: false
    }));

    return { valid, invalid, duplicates };
  }, [validateEmail]);

  const validateContacts = useCallback(async (contacts: any[]): Promise<{
    validContacts: any[];
    invalidContacts: any[];
    contactsWithoutEmail: any[];
  }> => {
    const validContacts: any[] = [];
    const invalidContacts: any[] = [];
    const contactsWithoutEmail: any[] = [];

    setValidationProgress({
      current: 0,
      total: contacts.length,
      percentage: 0,
      isValidating: true
    });

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      if (!contact.email || contact.email.trim() === '') {
        contactsWithoutEmail.push(contact);
      } else if (validateEmail(contact.email)) {
        validContacts.push(contact);
      } else {
        invalidContacts.push(contact);
      }

      // Atualizar progresso
      const percentage = Math.round(((i + 1) / contacts.length) * 100);
      setValidationProgress({
        current: i + 1,
        total: contacts.length,
        percentage,
        isValidating: true
      });

      // Pequeno delay
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    setValidationProgress(prev => ({
      ...prev,
      isValidating: false
    }));

    return { validContacts, invalidContacts, contactsWithoutEmail };
  }, [validateEmail]);

  const getEmailDomain = useCallback((email: string): string => {
    if (!email || !validateEmail(email)) return '';
    return email.split('@')[1] || '';
  }, [validateEmail]);

  const getEmailStats = useCallback((emails: string[]) => {
    const domains = new Map<string, number>();
    let validCount = 0;
    let invalidCount = 0;

    emails.forEach(email => {
      if (validateEmail(email)) {
        validCount++;
        const domain = getEmailDomain(email);
        domains.set(domain, (domains.get(domain) || 0) + 1);
      } else {
        invalidCount++;
      }
    });

    return {
      total: emails.length,
      valid: validCount,
      invalid: invalidCount,
      domains: Array.from(domains.entries()).map(([domain, count]) => ({ domain, count }))
    };
  }, [validateEmail, getEmailDomain]);

  return {
    validationProgress,
    validateEmail,
    validateEmails,
    validateContacts,
    getEmailDomain,
    getEmailStats
  };
}
