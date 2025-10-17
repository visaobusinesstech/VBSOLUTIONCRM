import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

// Obter idioma salvo no localStorage ou usar pt-BR como padrão
const savedLanguage = localStorage.getItem('app-language') || 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'pt-PT': { translation: ptPT },
      'en': { translation: en },
      'es': { translation: es },
      'fr': { translation: fr },
    },
    lng: savedLanguage,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

