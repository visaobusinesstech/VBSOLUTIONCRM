# Instruções para Configuração dos Novos Templates de Email

## 📋 O que foi implementado

Foi criado um novo sistema de templates de email com as seguintes funcionalidades:

### ✨ Funcionalidades Principais

1. **Página Única de Criação/Edição**
   - Formulário completo à esquerda
   - Preview em tempo real à direita
   - Sem seções ou tabs múltiplas

2. **Campos do Template**
   - ✅ Nome do template (obrigatório)
   - ✅ Descrição (opcional)
   - ✅ Variáveis personalizadas (criar e gerenciar)
   - ✅ Conteúdo HTML com editor de formatação
   - ✅ Upload de imagem principal
   - ✅ Anexos (todos os tipos de arquivo, até 25MB cada)
   - ✅ Assinatura automática das configurações do usuário

3. **Editor de Conteúdo**
   - Barra de ferramentas com formatação (Negrito, Itálico, Sublinhado)
   - Inserir links
   - Inserir imagens via URL
   - Suporte completo a HTML
   - Variáveis dinâmicas: `{nome}`, `{email}`, `{empresa}`, `{telefone}`, `{data}`, `{hora}`

4. **Anexos**
   - Upload de múltiplos arquivos
   - Suporte a todos os tipos de arquivo
   - Limite de 25MB por arquivo
   - Visualização da lista de anexos
   - Remoção individual de anexos

5. **Preview em Tempo Real**
   - Visualização do conteúdo renderizado
   - Substituição automática de variáveis com valores de exemplo
   - Exibição da assinatura do usuário
   - Lista de anexos

## 🔧 Configuração Necessária

### Passo 1: Criar Buckets de Storage no Supabase

Execute o script SQL no **Supabase SQL Editor**:

```sql
-- Arquivo: create-storage-buckets.sql
```

Este script cria:
- Bucket `template-images` para imagens de templates
- Bucket `template-attachments` para anexos
- Políticas de acesso apropriadas

**Como executar:**
1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor** (no menu lateral)
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `create-storage-buckets.sql`
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 2: Verificar a Estrutura da Tabela Templates

A tabela `templates` deve ter os seguintes campos:

```sql
- id (UUID)
- user_id (UUID) - referência ao usuário
- owner_id (UUID) - referência ao proprietário
- nome (TEXT) - nome do template
- descricao (TEXT) - descrição opcional
- conteudo (TEXT) - conteúdo HTML
- canal (TEXT) - tipo de canal (email)
- status (TEXT) - ativo/inativo
- image_url (TEXT) - URL da imagem principal
- attachments (JSONB) - array de anexos
- signature_image (TEXT) - URL da assinatura
- assinatura (TEXT) - texto da assinatura (deprecated)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

Se algum campo estiver faltando, o sistema está preparado para lidar com isso.

### Passo 3: Configurar Assinatura de Email

Para que a assinatura apareça automaticamente nos templates:

1. Vá em **Settings** > **Email**
2. Configure sua assinatura de email na seção de assinatura
3. Faça upload da imagem da assinatura
4. Salve as configurações

A assinatura será incluída automaticamente em todos os templates criados.

## 📝 Como Usar

### Criar um Novo Template

1. Na página **Email** > **Templates**
2. Clique no botão **+** para criar novo template
3. Preencha os campos:
   - **Nome**: Nome identificador do template
   - **Descrição**: Descrição breve (opcional)
   - **Variáveis**: Adicione variáveis personalizadas se necessário
   - **Conteúdo**: Digite o conteúdo do email (use a barra de ferramentas para formatação)
   - **Imagem**: Faça upload de uma imagem principal (opcional)
   - **Anexos**: Adicione arquivos anexos (opcional)
4. Visualize o preview à direita em tempo real
5. Clique em **Criar Template** para salvar

### Usar Variáveis

**Variáveis Padrão:**
- `{nome}` - Nome do contato
- `{email}` - Email do contato
- `{empresa}` - Nome da empresa
- `{telefone}` - Telefone do contato
- `{data}` - Data atual
- `{hora}` - Hora atual

**Variáveis Personalizadas:**
1. Na seção "Variáveis Personalizadas"
2. Digite o nome da variável (ex: `produto`)
3. Digite o valor padrão (ex: `Software CRM`)
4. Clique em **+** para adicionar
5. Use no conteúdo como `{produto}`

### Anexar Arquivos

1. Clique em **Adicionar Anexos**
2. Selecione um ou mais arquivos (máx 25MB cada)
3. Aguarde o upload completar
4. Os anexos aparecerão na lista abaixo
5. Clique no **X** para remover algum anexo

### Editar Template

1. Clique em **Editar** no card do template
2. Modifique os campos desejados
3. Visualize as mudanças no preview
4. Clique em **Atualizar Template**

## ⚠️ Importante: Compatibilidade com Envio de Email

### ✅ O que foi garantido:

1. **Estrutura de Dados Compatível**
   - Os anexos são salvos como JSON no formato esperado pelo sistema de envio
   - A assinatura é buscada automaticamente das configurações
   - O campo `attachments` é salvo corretamente

2. **Campos Mantidos**
   - Todos os campos existentes foram mantidos
   - Campos novos são opcionais e não quebram funcionalidades antigas

3. **Formato dos Anexos**
   ```json
   [
     {
       "name": "documento.pdf",
       "url": "https://...",
       "size": 12345,
       "type": "application/pdf"
     }
   ]
   ```

4. **Sistema de Envio**
   - O código de envio de email (`handleSendNow` em `EmailScheduling.tsx`) já está preparado para:
     - Processar anexos do template
     - Incluir a assinatura digital
     - Processar variáveis no conteúdo
   
### 🔍 Verificação

Para verificar se tudo está funcionando:

1. **Criar um template de teste**
   - Nome: "Teste"
   - Conteúdo: "Olá {nome}, este é um teste!"
   - Adicione um anexo pequeno (ex: txt ou pdf)

2. **Enviar um email de teste**
   - Vá em **Email** > **Agendamento**
   - Selecione o template "Teste"
   - Selecione um contato
   - Clique em **Enviar Agora**

3. **Verificar**
   - O email deve chegar com o conteúdo correto
   - A variável `{nome}` deve ser substituída
   - O anexo deve estar presente
   - A assinatura deve aparecer no final

## 🐛 Troubleshooting

### Erro ao fazer upload de imagem/anexo

**Problema:** "Erro ao fazer upload"

**Solução:**
1. Verifique se os buckets foram criados corretamente
2. Execute novamente o script `create-storage-buckets.sql`
3. Verifique as políticas de storage no Supabase Dashboard

### Assinatura não aparece no preview

**Problema:** Assinatura não está visível

**Solução:**
1. Vá em **Settings** > **Email**
2. Verifique se a imagem da assinatura foi carregada
3. Salve as configurações novamente
4. Recarregue a página de templates

### Anexos não são enviados no email

**Problema:** Email chega sem anexos

**Solução:**
1. Verifique se os anexos foram salvos corretamente no template
2. Verifique os logs do servidor (Edge Function `test-send-email`)
3. Confirme que o SMTP está configurado corretamente

### Preview não atualiza

**Problema:** Preview não mostra mudanças

**Solução:**
1. Recarregue a página
2. Verifique se há erros no console do navegador
3. Tente editar o conteúdo novamente

## 📚 Estrutura de Arquivos Modificados

- `frontend/src/components/email/EmailTemplates.tsx` - Componente principal (MODIFICADO)
- `create-storage-buckets.sql` - Script de criação de buckets (NOVO)
- `INSTRUCOES_NOVOS_TEMPLATES.md` - Este arquivo (NOVO)

## ✅ Checklist de Verificação

- [ ] Buckets de storage criados (`template-images` e `template-attachments`)
- [ ] Políticas de acesso configuradas
- [ ] Assinatura configurada em Settings > Email
- [ ] Template de teste criado com sucesso
- [ ] Upload de imagem funcionando
- [ ] Upload de anexo funcionando
- [ ] Preview exibindo corretamente
- [ ] Email de teste enviado com sucesso
- [ ] Variáveis sendo substituídas corretamente
- [ ] Anexos chegando no email
- [ ] Assinatura aparecendo no email

## 🎉 Pronto!

Após seguir todos os passos acima, o sistema de templates estará completo e funcional, com todas as funcionalidades solicitadas e garantia de que o envio de email continuará funcionando perfeitamente.

Se tiver algum problema, verifique:
1. Console do navegador (F12)
2. Logs do Supabase Edge Functions
3. Configurações de SMTP em Settings

