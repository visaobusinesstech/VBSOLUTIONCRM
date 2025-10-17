# Sistema de Internacionalização (i18n)

Este sistema permite traduzir todo o aplicativo para 5 idiomas:
- 🇧🇷 Português (Brasil) - pt-BR
- 🇵🇹 Português (Portugal) - pt-PT  
- 🇺🇸 Inglês - en
- 🇪🇸 Espanhol - es
- 🇫🇷 Francês - fr

## Como Usar em Componentes

### 1. Importar o hook useTranslation

```tsx
import { useTranslation } from 'react-i18next';

function MeuComponente() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('settings.profile.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. Adicionar novas traduções

Edite os arquivos em `src/i18n/locales/` para adicionar novas chaves de tradução:

**pt-BR.json**
```json
{
  "meuComponente": {
    "titulo": "Meu Título",
    "descricao": "Minha descrição"
  }
}
```

**en.json**
```json
{
  "meuComponente": {
    "titulo": "My Title",
    "descricao": "My description"
  }
}
```

E assim por diante para os outros idiomas.

### 3. Usar o seletor de idioma

O seletor de idioma está disponível em `/settings` na aba "Perfil", seção "Meu Perfil".

### 4. Acessar o idioma atual programaticamente

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MeuComponente() {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  // currentLanguage retorna: 'pt-BR', 'en', 'es', etc.
  // changeLanguage('en') - muda para inglês
}
```

## Arquitetura

- **config.ts** - Configuração do i18n
- **locales/** - Arquivos JSON com traduções
- **LanguageContext** - Contexto React para gerenciar idioma
- **LanguageSelector** - Componente visual do seletor

O idioma selecionado é salvo automaticamente no `localStorage` e persiste entre sessões.

