# 🎯 FLUXO COMPLETO DO SISTEMA - DO ZERO ATÉ MÚLTIPLOS USUÁRIOS

## 📍 PASSO 1: PRIMEIRO REGISTRO (LEO - DONO DA EMPRESA)

### 1.1 - LEO acessa a página de REGISTRO (`/register`)

**O que acontece:**
- LEO preenche os 4 passos:
  - Tela 1: Nome, Nome da empresa, Telefone
  - Tela 2: Cargo, Quantidade de funcionários
  - Tela 3: Nicho, Público-alvo
  - Tela 4: Email e Senha

### 1.2 - Ao clicar em "FINALIZAR", o sistema executa `signUpCompany()`:

```javascript
// 1. Cria usuário no Supabase Auth
Supabase Auth cria: leo@email.com com senha

// 2. Gera OWNER_ID único
owner_id = UUID do usuário criado (ex: abc-123-def)

// 3. Salva em COMPANY_USERS
company_users:
┌─────────┬───────────────┬──────────┬──────────────┬───────┐
│ Nome    │ Email         │ owner_id │ company_name │ role  │
├─────────┼───────────────┼──────────┼──────────────┼───────┤
│ Leo     │ leo@email.com │ abc-123  │ VB Solution  │ admin │
└─────────┴───────────────┴──────────┴──────────────┴───────┘

// 4. Salva em PROFILES
profiles:
┌─────────┬───────────────┬──────────┬──────────────┐
│ Nome    │ Email         │ owner_id │ company      │
├─────────┼───────────────┼──────────┼──────────────┤
│ Leo     │ leo@email.com │ abc-123  │ VB Solution  │
└─────────┴───────────────┴──────────┴──────────────┘

// 5. Redireciona para o sistema
navigate('/') → Dashboard
```

---

## 📍 PASSO 2: LEO CRIA A ESTRUTURA DA EMPRESA

### 2.1 - LEO vai em "ESTRUTURA" (`/employees`)

**O que LEO cadastra:**
```
SETORES (type = 'sector'):
- Diretoria
- Vendas
- Marketing
- Financeiro

CARGOS (type = 'position'):
- Diretor
- Gerente de Vendas
- Analista de Marketing
- Assistente Financeiro
```

### 2.2 - Dados salvos em `organizational_structure`:

```sql
organizational_structure:
┌──────────┬───────────────────────────┬──────────┬──────────┐
│ id       │ name                      │ type     │ owner_id │
├──────────┼───────────────────────────┼──────────┼──────────┤
│ uuid-1   │ Diretoria                 │ sector   │ abc-123  │
│ uuid-2   │ Vendas                    │ sector   │ abc-123  │
│ uuid-3   │ Diretor                   │ position │ abc-123  │
│ uuid-4   │ Gerente de Vendas         │ position │ abc-123  │
│ uuid-5   │ Analista de Marketing     │ position │ abc-123  │
│ uuid-6   │ Assistente Financeiro     │ position │ abc-123  │
└──────────┴───────────────────────────┴──────────┴──────────┘
```

**✅ IMPORTANTE:** Todos com `owner_id = abc-123` (do LEO)

---

## 📍 PASSO 3: LEO CADASTRA USUÁRIOS DA EMPRESA

### 3.1 - LEO vai em "SETTINGS" → aba "USUÁRIOS"

**LEO quer cadastrar DAVI como "Gerente de Vendas"**

### 3.2 - Formulário carrega CARGOS cadastrados:

```javascript
// Sistema busca em organizational_structure
SELECT * FROM organizational_structure 
WHERE type = 'position' 
AND owner_id = (SELECT owner_id FROM company_users WHERE email = 'leo@email.com')

// Retorna:
[
  { id: 'uuid-3', name: 'Diretor' },
  { id: 'uuid-4', name: 'Gerente de Vendas' },
  { id: 'uuid-5', name: 'Analista de Marketing' },
  { id: 'uuid-6', name: 'Assistente Financeiro' }
]

// Dropdown mostra: ⬇️
- Diretor
- Gerente de Vendas ← LEO SELECIONA ESTE
- Analista de Marketing
- Assistente Financeiro
```

### 3.3 - LEO preenche o formulário:

```
Nome: Davi
Email: davi@email.com
Senha: senha123
Cargo: Gerente de Vendas (selecionado do dropdown)
Telefone: (11) 99999-9999
```

### 3.4 - Ao clicar em "CADASTRAR", o sistema executa `createCompanyUser()`:

```javascript
// 1. Busca o owner_id do LEO
const { data } = await supabase
  .from('company_users')
  .select('owner_id, company_name')
  .eq('email', 'leo@email.com')  // Email do usuário logado (LEO)
  .single();

// Retorna: owner_id = 'abc-123'

// 2. Cria login do DAVI no Supabase Auth
Supabase Auth cria: davi@email.com com senha

// 3. Salva DAVI em COMPANY_USERS com owner_id do LEO
company_users:
┌─────────┬────────────────┬──────────┬──────────────┬──────────────────────┬───────┐
│ Nome    │ Email          │ owner_id │ company_name │ position             │ role  │
├─────────┼────────────────┼──────────┼──────────────┼──────────────────────┼───────┤
│ Leo     │ leo@email.com  │ abc-123  │ VB Solution  │ Diretor              │ admin │
│ Davi    │ davi@email.com │ abc-123  │ VB Solution  │ Gerente de Vendas    │ user  │ ← MESMO OWNER_ID!
└─────────┴────────────────┴──────────┴──────────────┴──────────────────────┴───────┘

// 4. Salva DAVI em PROFILES com owner_id do LEO
profiles:
┌─────────┬────────────────┬──────────┬──────────────┬──────────────────────┐
│ Nome    │ Email          │ owner_id │ company      │ position             │
├─────────┼────────────────┼──────────┼──────────────┼──────────────────────┤
│ Leo     │ leo@email.com  │ abc-123  │ VB Solution  │ Diretor              │
│ Davi    │ davi@email.com │ abc-123  │ VB Solution  │ Gerente de Vendas    │ ← MESMO OWNER_ID!
└─────────┴────────────────┴──────────┴──────────────┴──────────────────────┘

// 5. DAVI pode fazer login no sistema!
```

---

## 📍 PASSO 4: DAVI TAMBÉM PODE CADASTRAR USUÁRIOS

### 4.1 - DAVI faz login e vai em "SETTINGS" → "USUÁRIOS"

**DAVI quer cadastrar MARIA como "Analista de Marketing"**

### 4.2 - Sistema busca o owner_id do DAVI:

```javascript
// 1. Tenta buscar em company_users
const { data } = await supabase
  .from('company_users')
  .select('owner_id, company_name')
  .eq('email', 'davi@email.com')
  .single();

// Retorna: owner_id = 'abc-123' ✅

// 2. Se não encontrar em company_users, busca em profiles
// (neste caso encontrou, então não precisa)
```

### 4.3 - DAVI cadastra MARIA:

```javascript
// Sistema usa owner_id = 'abc-123' (mesmo do LEO e DAVI)

// Salva MARIA em COMPANY_USERS
company_users:
┌─────────┬─────────────────┬──────────┬──────────────┬───────────────────────┬───────┐
│ Nome    │ Email           │ owner_id │ company_name │ position              │ role  │
├─────────┼─────────────────┼──────────┼──────────────┼───────────────────────┼───────┤
│ Leo     │ leo@email.com   │ abc-123  │ VB Solution  │ Diretor               │ admin │
│ Davi    │ davi@email.com  │ abc-123  │ VB Solution  │ Gerente de Vendas     │ user  │
│ Maria   │ maria@email.com │ abc-123  │ VB Solution  │ Analista de Marketing │ user  │ ← MESMO OWNER_ID!
└─────────┴─────────────────┴──────────┴──────────────┴───────────────────────┴───────┘

// Salva MARIA em PROFILES
profiles:
┌─────────┬─────────────────┬──────────┬──────────────┬───────────────────────┐
│ Nome    │ Email           │ owner_id │ company      │ position              │
├─────────┼─────────────────┼──────────┼──────────────┼───────────────────────┤
│ Leo     │ leo@email.com   │ abc-123  │ VB Solution  │ Diretor               │
│ Davi    │ davi@email.com  │ abc-123  │ VB Solution  │ Gerente de Vendas     │
│ Maria   │ maria@email.com │ abc-123  │ VB Solution  │ Analista de Marketing │ ← MESMO OWNER_ID!
└─────────┴─────────────────┴──────────┴──────────────┴───────────────────────┘
```

---

## 📍 PASSO 5: OUTRA EMPRESA SE REGISTRA

### 5.1 - JOÃO cria uma nova empresa (XYZ Corp)

```javascript
// JOÃO se registra em /register
// Sistema gera NOVO owner_id = 'xyz-789'

company_users:
┌─────────┬─────────────────┬──────────┬──────────────┬──────────────────────┬───────┐
│ Nome    │ Email           │ owner_id │ company_name │ position             │ role  │
├─────────┼─────────────────┼──────────┼──────────────┼──────────────────────┼───────┤
│ Leo     │ leo@email.com   │ abc-123  │ VB Solution  │ Diretor              │ admin │
│ Davi    │ davi@email.com  │ abc-123  │ VB Solution  │ Gerente de Vendas    │ user  │
│ Maria   │ maria@email.com │ abc-123  │ VB Solution  │ Analista             │ user  │
│ João    │ joao@email.com  │ xyz-789  │ XYZ Corp     │ CEO                  │ admin │ ← OWNER_ID DIFERENTE!
└─────────┴─────────────────┴──────────┴──────────────┴──────────────────────┴───────┘
```

---

## 🎯 RESUMO DO FLUXO:

```
1️⃣ REGISTRO (/register)
   └─> Cria owner_id ÚNICO
   └─> Salva em company_users (role = admin)
   └─> Salva em profiles
   └─> Redireciona para sistema

2️⃣ ESTRUTURA (/employees)
   └─> Cadastra SETORES (type = sector)
   └─> Cadastra CARGOS (type = position)
   └─> Todos com owner_id da empresa

3️⃣ CADASTRO DE USUÁRIOS (/settings → Usuários)
   └─> Busca owner_id de quem está logado
   └─> Busca cargos cadastrados (dropdown)
   └─> Cria login no Supabase Auth
   └─> Salva em company_users (com owner_id da empresa)
   └─> Salva em profiles (com owner_id da empresa)

4️⃣ ISOLAMENTO DE DADOS
   └─> Todas as consultas filtram por owner_id
   └─> LEO, DAVI e MARIA veem apenas dados com owner_id = abc-123
   └─> JOÃO vê apenas dados com owner_id = xyz-789
```

---

## ✅ GARANTIAS:

- ✅ **Owner_id é gerado** no primeiro registro
- ✅ **Owner_id é propagado** para todos os usuários da empresa
- ✅ **Owner_id é usado** em todas as tabelas para isolamento
- ✅ **Cargos são carregados** da estrutura organizacional
- ✅ **Dados são isolados** por empresa automaticamente

---

## 🔧 CÓDIGO RELEVANTE:

### signUpCompany (Registro inicial):
```javascript
const ownerId = authData.user.id; // Gera owner_id único
// Salva em company_users com owner_id
// Salva em profiles com owner_id
```

### createCompanyUser (Cadastro de usuários):
```javascript
// Busca owner_id de quem está logado
const ownerId = buscar_owner_id_do_usuario_logado();
// Usa o MESMO owner_id para o novo usuário
// Salva em company_users com owner_id
// Salva em profiles com owner_id
```

### Busca de cargos:
```javascript
// Busca cargos da mesma empresa
SELECT * FROM organizational_structure 
WHERE type = 'position' 
AND owner_id = owner_id_do_usuario_logado
```

