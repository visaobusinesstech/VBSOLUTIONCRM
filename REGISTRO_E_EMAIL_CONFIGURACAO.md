# 📝 Configuração de Registro e Envio de Email - VB Solution

## ✅ Alterações Realizadas

### 1. **Criação da Empresa durante o Registro**
Agora, quando um usuário se registra, o sistema cria automaticamente:

- ✅ **Usuário no Supabase Auth** (`auth.users`)
- ✅ **Registro na tabela `companies`** com todas as informações da empresa
- ✅ **Registro na tabela `company_users`** com o usuário como administrador
- ✅ **Perfil na tabela `profiles`** vinculado à empresa criada

**Dados salvos na tabela `companies`:**
- `owner_id`: ID do proprietário/fundador
- `fantasy_name`: Nome fantasia da empresa
- `company_name`: Razão social da empresa
- `email`: Email da empresa
- `phone`: Telefone da empresa
- `sector`: Setor de atuação (nicho da empresa)
- `status`: Status da empresa (ativo)
- `settings`: Configurações adicionais (quantidade de funcionários, público-alvo)

### 2. **Redirecionamento Automático para Home**
Após o cadastro bem-sucedido:
- ✅ O sistema cria automaticamente uma sessão para o usuário (login automático)
- ✅ Redireciona para a página Home após 1 segundo
- ✅ Mostra mensagem de sucesso com confirmação de envio de email

### 3. **Envio de Email de Verificação**
O Supabase Auth envia automaticamente um email de verificação para o endereço cadastrado.

---

## 📧 Configuração de Emails no Supabase

### **Ambiente Local (Desenvolvimento)**

Por padrão, o ambiente local está configurado com:
- `enable_confirmations = false` no arquivo `frontend/supabase/config.toml` (linha 70)
- Emails são capturados pelo **Inbucket** (servidor de emails de teste)

**Para visualizar os emails de teste:**
1. Acesse: `http://localhost:54324`
2. Você verá todos os emails que seriam enviados

### **Ambiente de Produção**

Para que os emails sejam enviados em produção, você precisa configurar o SMTP no Supabase:

#### **Opção 1: Usar o SMTP do Supabase (Recomendado)**
1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá em **Authentication** → **Email Templates**
3. Configure o provedor de email (Supabase tem um SMTP padrão)

#### **Opção 2: Configurar SMTP Customizado**
1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá em **Settings** → **Authentication**
3. Em **SMTP Settings**, configure:
   - **Host**: Servidor SMTP (ex: `smtp.gmail.com`)
   - **Port**: Porta SMTP (ex: `587` para TLS, `465` para SSL)
   - **Username**: Email do remetente
   - **Password**: Senha do email ou App Password
   - **From Email**: Email que aparecerá como remetente

#### **Opção 3: Habilitar Confirmação de Email (Opcional)**
Se você quiser exigir que os usuários confirmem o email antes de fazer login:

1. No **Dashboard do Supabase**:
   - Vá em **Authentication** → **Email Auth**
   - Ative **Enable email confirmations**

2. No arquivo `frontend/supabase/config.toml` (linha 70):
   ```toml
   [auth.email]
   enable_signup = true
   enable_confirmations = true  # Mudar para true
   ```

---

## 🔄 Fluxo de Registro Atualizado

### **Passo 1: Usuário preenche o formulário**
- Nome completo
- Nome da empresa
- Telefone da empresa
- Cargo
- Quantidade de funcionários
- Nicho da empresa
- Público-alvo
- Email
- Senha

### **Passo 2: Sistema processa o registro**
1. Cria usuário no Supabase Auth
2. Envia email de verificação para o endereço cadastrado
3. Cria registro na tabela `companies`
4. Cria registro na tabela `company_users` (usuário como admin)
5. Cria perfil na tabela `profiles`
6. Cria sessão automaticamente (login automático)

### **Passo 3: Usuário é redirecionado**
- Mostra toast de sucesso informando que o email foi enviado
- Redireciona para a Home após 1 segundo
- Usuário já está logado e pode usar o sistema

### **Passo 4: Confirmação de email (opcional)**
- O usuário pode confirmar o email clicando no link recebido
- Mesmo sem confirmar, o usuário pode usar o sistema (configuração atual)

---

## 🎯 Arquivos Modificados

### 1. **`frontend/src/hooks/useAuth.ts`**
```typescript
// Função signUpCompany atualizada:
// ✅ Cria empresa na tabela companies
// ✅ Vincula perfil ao company_id
// ✅ Envia email de verificação
// ✅ Retorna sessão criada
```

### 2. **`frontend/src/pages/Register.tsx`**
```typescript
// handleSubmit atualizado:
// ✅ Redireciona para Home após 1 segundo
// ✅ Remove etapa 5 (tela de confirmação)
// ✅ Mostra logs informativos
```

---

## 🧪 Testando o Fluxo

### **Teste Local:**
1. Execute o frontend: `pnpm dev`
2. Acesse: `http://localhost:3000/register`
3. Preencha o formulário completo
4. Clique em finalizar
5. Verifique:
   - ✅ Redirecionamento para Home
   - ✅ Email no Inbucket: `http://localhost:54324`
   - ✅ Registro na tabela `companies` no Supabase
   - ✅ Registro na tabela `company_users` no Supabase
   - ✅ Perfil na tabela `profiles` no Supabase

### **Teste em Produção:**
1. Faça deploy do código
2. Configure o SMTP no Supabase
3. Teste o registro
4. Verifique se o email chegou na caixa de entrada

---

## 📚 Recursos Adicionais

### **Configuração de Email Templates no Supabase**
Você pode customizar os templates de email:
1. Acesse **Authentication** → **Email Templates**
2. Edite o template de **Confirm Email**
3. Use variáveis como:
   - `{{ .ConfirmationURL }}`: Link de confirmação
   - `{{ .Token }}`: Token de confirmação
   - `{{ .Email }}`: Email do usuário

### **Configuração de Redirect URL**
O sistema já está configurado para redirecionar para Home após confirmação:
```typescript
emailRedirectTo: `${window.location.origin}/`
```

---

## 🐛 Troubleshooting

### **Emails não estão sendo enviados**
- Verifique se o SMTP está configurado no Supabase
- Verifique os logs do Supabase no Dashboard
- Teste com um email real (não temporário)

### **Usuário não consegue fazer login**
- Verifique se `enable_confirmations = false` no config.toml
- Ou certifique-se de que o email foi confirmado

### **Erro ao criar empresa**
- Verifique se a tabela `companies` existe no Supabase
- Verifique as permissões RLS da tabela

---

## 📝 Notas Importantes

1. **Segurança**: Em produção, implemente hash de senha adequado
2. **RLS (Row Level Security)**: Certifique-se de que as políticas RLS estão configuradas
3. **Confirmação de Email**: A configuração atual permite login sem confirmação
4. **SMTP**: Configure um SMTP confiável em produção (evite spam)

---

## ✅ Checklist de Implementação

- [x] Criar empresa na tabela `companies`
- [x] Criar usuário admin na tabela `company_users`
- [x] Criar perfil na tabela `profiles`
- [x] Enviar email de verificação
- [x] Fazer login automático
- [x] Redirecionar para Home
- [ ] Configurar SMTP em produção
- [ ] Customizar template de email
- [ ] Testar em produção

---

**Data da Implementação**: 16 de Outubro de 2025
**Versão**: 1.0

