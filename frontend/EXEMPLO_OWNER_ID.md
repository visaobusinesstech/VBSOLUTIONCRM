# 🎯 EXEMPLO DO FLUXO DE OWNER_ID

## 📊 Cenário:

### 1️⃣ **LEO se registra no sistema:**

**Tabela: `company_users`**
```
┌────────────┬───────────────┬───────────────────┬──────────┐
│ full_name  │ email         │ owner_id          │ role     │
├────────────┼───────────────┼───────────────────┼──────────┤
│ Leo        │ leo@email.com │ 1                 │ admin    │
└────────────┴───────────────┴───────────────────┴──────────┘
```

**Tabela: `profiles`**
```
┌────────────┬───────────────┬───────────────────┐
│ name       │ email         │ owner_id          │
├────────────┼───────────────┼───────────────────┤
│ Leo        │ leo@email.com │ 1                 │
└────────────┴───────────────┴───────────────────┘
```

---

### 2️⃣ **LEO cadastra DAVI em Settings → Usuários:**

**O sistema faz:**
1. ✅ Busca o `owner_id` do LEO em `company_users` → encontra `owner_id = 1`
2. ✅ Cria login do DAVI no Supabase Auth
3. ✅ Cria registro do DAVI **APENAS em `profiles`** com `owner_id = 1`

**Tabela: `company_users`** (NÃO MUDA)
```
┌────────────┬───────────────┬───────────────────┬──────────┐
│ full_name  │ email         │ owner_id          │ role     │
├────────────┼───────────────┼───────────────────┼──────────┤
│ Leo        │ leo@email.com │ 1                 │ admin    │
└────────────┴───────────────┴───────────────────┴──────────┘
```

**Tabela: `profiles`** (DAVI É ADICIONADO)
```
┌────────────┬────────────────┬───────────────────┐
│ name       │ email          │ owner_id          │
├────────────┼────────────────┼───────────────────┤
│ Leo        │ leo@email.com  │ 1                 │
│ Davi       │ davi@email.com │ 1  ← MESMO ID!    │
└────────────┴────────────────┴───────────────────┘
```

---

### 3️⃣ **DAVI faz login e cadastra MARIA:**

**O sistema faz:**
1. ✅ Busca o `owner_id` do DAVI em `company_users` → NÃO encontra
2. ✅ Busca o `owner_id` do DAVI em `profiles` → encontra `owner_id = 1`
3. ✅ Cria login da MARIA no Supabase Auth
4. ✅ Cria registro da MARIA **APENAS em `profiles`** com `owner_id = 1`

**Tabela: `profiles`** (MARIA É ADICIONADA)
```
┌────────────┬─────────────────┬───────────────────┐
│ name       │ email           │ owner_id          │
├────────────┼─────────────────┼───────────────────┤
│ Leo        │ leo@email.com   │ 1                 │
│ Davi       │ davi@email.com  │ 1                 │
│ Maria      │ maria@email.com │ 1  ← MESMO ID!    │
└────────────┴─────────────────┴───────────────────┘
```

---

## 🎉 Resultado Final:

✅ **LEO, DAVI e MARIA** → Todos com `owner_id = 1`
✅ **Isolamento de dados** garantido
✅ **Todos veem apenas os dados da empresa deles**

---

## 🔄 Como funciona a busca do owner_id:

```javascript
// 1. Tenta buscar em company_users (se for admin/dono)
const companyData = buscar_em_company_users(usuario_logado.email)

if (companyData encontrado) {
  owner_id = companyData.owner_id  // LEO encontra aqui
} else {
  // 2. Se não encontrar, busca em profiles (se for usuário comum)
  const profileData = buscar_em_profiles(usuario_logado.id)
  owner_id = profileData.owner_id  // DAVI e MARIA encontram aqui
}

// 3. Cria novo usuário em profiles com esse owner_id
criar_usuario_em_profiles(novo_usuario, owner_id)
```

---

## ✨ Fluxo Completo:

```
LEO (admin) cadastra → owner_id da empresa
    ↓
DAVI recebe → owner_id = 1
    ↓
MARIA recebe → owner_id = 1
    ↓
TODOS veem → apenas dados da empresa com owner_id = 1
```

