# 🌍 Guia Completo: Como Traduzir Todas as Páginas do Sistema

## ⚠️ SITUAÇÃO ATUAL

Atualmente, o sistema de tradução está configurado corretamente com:
- ✅ `react-i18next` instalado e configurado
- ✅ Arquivos de tradução criados para 5 idiomas (pt-BR, pt-PT, en, es, fr)
- ✅ Componentes de navegação traduzidos (Sidebar, Topbar, Settings, Kanban)
- ✅ Seletor de idioma funcional

**PROBLEMA**: As **páginas individuais** ainda têm textos hardcoded em português e **não se traduzem automaticamente**.

## 📋 PÁGINAS QUE PRECISAM SER TRADUZIDAS

### Principais (16 páginas):
1. ✅ `/` - Index/Dashboard
2. ❌ `/activities` - Atividades  
3. ❌ `/projects` - Projetos
4. ❌ `/companies` - Empresas
5. ❌ `/inventory` - Inventário
6. ❌ `/writeoffs` - Baixas
7. ❌ `/leads-sales` - Leads e Vendas
8. ❌ `/suppliers` - Fornecedores
9. ❌ `/calendar` - Calendário
10. ❌ `/automations` - Automações
11. ❌ `/ai-agent` - Agente de IA
12. ❌ `/whatsapp` - WhatsApp
13. ❌ `/files` - Arquivos
14. ❌ `/work-groups` - Grupos de Trabalho
15. ❌ `/feed` - Feed
16. ❌ `/reports` - Relatórios

## 🔧 SOLUÇÃO: Processo em 3 Etapas

### ETAPA 1: Expandir Arquivos de Tradução

Adicione as traduções específicas de cada página nos arquivos JSON.

#### Exemplo para a página Index/Dashboard:

**`frontend/src/i18n/locales/pt-BR.json`**:
```json
{
  "pages": {
    "index": {
      "greeting": {
        "morning": "Bom dia",
        "afternoon": "Boa tarde",
        "evening": "Boa noite"
      },
      "manageCards": "Gerenciar cartões",
      "addCard": "Adicionar cartão",
      "removeCard": "Remover cartão",
      "recentActivities": "Atividades Recentes",
      "upcomingProjects": "Projetos Próximos",
      "workGroups": "Grupos de Trabalho",
      "calendar": "Calendário",
      "recentPosts": "Postagens Recentes",
      "viewAll": "Ver todos",
      "noActivities": "Nenhuma atividade encontrada",
      "noProjects": "Nenhum projeto encontrado",
      "noWorkGroups": "Nenhum grupo de trabalho",
      "noPosts": "Nenhuma postagem recente"
    }
  }
}
```

### ETAPA 2: Modificar Cada Página para Usar Traduções

#### Template de Modificação:

```tsx
// 1. IMPORTAR useTranslation no topo do arquivo
import { useTranslation } from 'react-i18next';

// 2. ADICIONAR hook dentro do componente
export default function MinhaPage() {
  const { t } = useTranslation();
  
  // 3. SUBSTITUIR TEXTOS HARDCODED
  // ANTES:
  return <h1>Bom dia, {userName}</h1>;
  
  // DEPOIS:
  return <h1>{t('pages.index.greeting.morning')}, {userName}</h1>;
}
```

#### Exemplo Completo - Index.tsx:

**ANTES** (linha 95):
```tsx
if (hour >= 5 && hour < 12) {
  return `Bom dia, ${userName}`;
} else if (hour >= 12 && hour < 18) {
  return `Boa tarde, ${userName}`;
} else {
  return `Boa noite, ${userName}`;
}
```

**DEPOIS**:
```tsx
const { t } = useTranslation(); // Adicionar no topo do componente

if (hour >= 5 && hour < 12) {
  return `${t('pages.index.greeting.morning')}, ${userName}`;
} else if (hour >= 12 && hour < 18) {
  return `${t('pages.index.greeting.afternoon')}, ${userName}`;
} else {
  return `${t('pages.index.greeting.evening')}, ${userName}`;
}
```

### ETAPA 3: Testar e Verificar

1. Salve as alterações
2. Recarregue o navegador
3. Vá em Configurações → Meu Perfil
4. Troque o idioma
5. Verifique se a página se traduziu

## 📝 LISTA DE TERMOS COMUNS POR PÁGINA

### 🏠 Index/Dashboard
```
- Bom dia, Boa tarde, Boa noite
- Gerenciar cartões
- Adicionar cartão
- Atividades Recentes
- Projetos Próximos
- Grupos de Trabalho
- Calendário
- Postagens Recentes
- Ver todos
- Nenhuma atividade encontrada
```

### 📋 Activities (Atividades)
```
- Nova atividade
- Quadro Kanban
- Lista
- Por prazo
- Planejador
- Calendário
- Dashboard
- Filtros
- Buscar atividades
- Ordenar
- Exibir filtros
- Ocultar filtros
- Automações
- Configurar Kanban
- Modo tela cheia
- A fazer, Fazendo, Feito
```

### 📁 Projects (Projetos)
```
- Novo projeto
- Quadro Kanban
- Lista
- Por prazo
- Planejador
- Calendário
- Dashboard
- Filtros
- Buscar projetos
- Ordenar
- Exibir filtros
- Ocultar filtros
- Automações
- Configurar Kanban
- Ver atividades
- Editar
- Excluir
```

### 🏢 Companies (Empresas)
```
- Nova empresa
- Buscar empresas
- Nome
- CNPJ
- Telefone
- Email
- Endereço
- Cidade
- Estado
- Responsável
- Status
- Ativo, Inativo
```

### 📦 Inventory (Inventário)
```
- Novo item
- Buscar itens
- Código
- Nome
- Categoria
- Quantidade
- Preço
- Fornecedor
- Estoque mínimo
- Estoque máximo
- Localização
```

### 💰 Leads e Vendas
```
- Novo lead
- Funil de vendas
- Nome
- Empresa
- Email
- Telefone
- Valor estimado
- Probabilidade
- Próxima ação
- Responsável
- Status do lead
```

### 🚚 Suppliers (Fornecedores)
```
- Novo fornecedor
- Buscar fornecedores
- Nome
- CNPJ
- Telefone
- Email
- Endereço
- Produtos fornecidos
- Condições de pagamento
```

### 📅 Calendar (Calendário)
```
- Novo evento
- Hoje
- Semana
- Mês
- Agenda
- Eventos
- Reuniões
- Compromissos
- Título do evento
- Data de início
- Data de término
- Local
- Participantes
- Descrição
```

### ⚙️ Automations (Automações)
```
- Nova automação
- Nome
- Trigger (Gatilho)
- Ação
- Condições
- Ativo
- Inativo
- Editar
- Excluir
- Testar
- Logs
```

### 🤖 AI Agent (Agente de IA)
```
- Nova conversa
- Histórico
- Enviar mensagem
- Digite sua mensagem
- Processando
- Sugestões
- Comandos
- Configurações
```

### 💬 WhatsApp
```
- Conversas
- Nova conversa
- Buscar conversas
- Digite uma mensagem
- Enviar
- Anexar
- Online
- Visto por último
- Digitando
```

### 📄 Files (Arquivos)
```
- Novo arquivo
- Upload
- Buscar arquivos
- Nome
- Tipo
- Tamanho
- Data de upload
- Pasta
- Baixar
- Compartilhar
- Mover
- Renomear
```

### 👥 Work Groups (Grupos de Trabalho)
```
- Novo grupo
- Buscar grupos
- Nome do grupo
- Descrição
- Membros
- Administrador
- Atividades
- Projetos
- Arquivos compartilhados
```

### 📰 Feed
```
- Nova postagem
- Publicar
- Curtir
- Comentar
- Compartilhar
- O que você está pensando?
- Comentários
- Sem postagens
```

### 📊 Reports (Relatórios)
```
- Novo relatório
- Dashboard
- Período
- Tipo de relatório
- Filtros
- Exportar
- PDF
- Excel
- Gráficos
- Tabelas
- Análises
```

## 🎯 EXEMPLO COMPLETO: Traduzindo a Página Index

### 1. Atualizar pt-BR.json:
```json
{
  "pages": {
    "index": {
      "greeting": {
        "morning": "Bom dia",
        "afternoon": "Boa tarde",
        "evening": "Boa noite"
      },
      "manageCards": "Gerenciar cartões",
      "addCard": "Adicionar cartão",
      "cards": {
        "recentActivities": "Atividades Recentes",
        "upcomingProjects": "Projetos Próximos",
        "workGroups": "Grupos de Trabalho",
        "calendar": "Calendário",
        "recentPosts": "Postagens Recentes"
      },
      "viewAll": "Ver todos",
      "empty": {
        "activities": "Nenhuma atividade encontrada",
        "projects": "Nenhum projeto encontrado",
        "workGroups": "Nenhum grupo de trabalho",
        "posts": "Nenhuma postagem recente"
      }
    }
  }
}
```

### 2. Modificar Index.tsx:

```tsx
// No topo, adicionar import
import { useTranslation } from 'react-i18next';

// Dentro do componente Index()
export default function Index() {
  const { t } = useTranslation(); // Adicionar esta linha
  
  // Substituir a função getGreeting():
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return `${t('pages.index.greeting.morning')}, ${userName}`;
    } else if (hour >= 12 && hour < 18) {
      return `${t('pages.index.greeting.afternoon')}, ${userName}`;
    } else {
      return `${t('pages.index.greeting.evening')}, ${userName}`;
    }
  };
  
  // Buscar todos os textos hardcoded e substituir:
  // "Gerenciar cartões" → {t('pages.index.manageCards')}
  // "Adicionar cartão" → {t('pages.index.addCard')}
  // "Atividades Recentes" → {t('pages.index.cards.recentActivities')}
  // etc...
}
```

## 🚀 AUTOMATIZAÇÃO (Opcional)

Para acelerar o processo, você pode criar um script Node.js que:
1. Lê todos os arquivos `.tsx` em `pages/`
2. Identifica strings hardcoded em português
3. Gera automaticamente as chaves de tradução
4. Substitui no código

**Exemplo de script** (`scripts/translate-pages.js`):
```javascript
const fs = require('fs');
const path = require('path');

const pagesDir = './frontend/src/pages';
const files = fs.readdirSync(pagesDir);

const hardcodedStrings = [];

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    
    // Regex para encontrar strings em português
    const regex = /"([A-ZÁÉÍÓÚÂÊÔÀÃÕÇ][a-záéíóúâêôàãõç\s]+)"/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      hardcodedStrings.push({ file, string: match[1] });
    }
  }
});

console.log('Strings hardcoded encontradas:', hardcodedStrings);
```

## ✅ CHECKLIST FINAL

- [ ] Expandir arquivos de tradução (pt-BR.json, en.json, es.json, fr.json, pt-PT.json)
- [ ] Adicionar `import { useTranslation } from 'react-i18next';` em cada página
- [ ] Adicionar `const { t } = useTranslation();` dentro do componente
- [ ] Substituir TODOS os textos hardcoded por `{t('chave.da.traducao')}`
- [ ] Testar cada página trocando o idioma
- [ ] Verificar se arrays dinâmicos usam `useMemo(() => [...], [t])`

## 💡 DICA IMPORTANTE

Use o VS Code Find & Replace com regex para acelerar:
1. Pressione `Ctrl+Shift+F` (busca global)
2. Ative regex (ícone `.*`)
3. Busque: `"(Bom dia|Boa tarde|Boa noite)"`
4. Substitua por: `{t('pages.index.greeting.XXXXX')}`

## 🎉 RESULTADO ESPERADO

Após aplicar este guia em TODAS as 16 páginas:
- ✅ Usuário troca idioma em Configurações
- ✅ TODO o sistema se traduz instantaneamente
- ✅ Todas as páginas mostram textos no idioma correto
- ✅ Navegação, filtros, botões, mensagens - TUDO traduzido!

---

**Precisa de ajuda?** Posso ajudar a traduzir página por página seguindo este guia!

