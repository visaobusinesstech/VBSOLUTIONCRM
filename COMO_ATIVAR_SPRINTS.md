# 🚀 Como Ativar o Sistema de Sprints

## ⚡ Guia Rápido (5 minutos)

### Passo 1: Aplicar Migração no Supabase

Você tem **2 opções**:

#### Opção A - Script Automatizado (Recomendado)

```bash
node apply_sprint_migration.js
```

#### Opção B - SQL Editor do Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Copie todo o conteúdo do arquivo:
   ```
   supabase/migrations/20250115000000_add_sprint_support.sql
   ```
6. Cole no editor
7. Clique em **Run** (▶️)

### Passo 2: Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
pnpm dev
```

### Passo 3: Testar o Sistema

1. Acesse: http://localhost:5173/activities
2. Role até a seção **"Acompanhamento de Sprints"**
3. Clique em **"Iniciar Sprint"**
4. Digite: "Sprint 1 - Teste"
5. Clique em **"Iniciar Sprint"**

**✅ Se aparecer a Sprint criada, está funcionando!**

---

## 🎯 Teste Completo (10 minutos)

### 1. Criar Sprint ✅

```
1. Vá em /activities
2. Clique em "Iniciar Sprint"
3. Digite o nome (ex: "Sprint 1")
4. Clique em "Iniciar Sprint"
```

**Resultado esperado:**
- ✅ Sprint aparece no card
- ✅ Badge "Em Andamento"
- ✅ Toast de confirmação

### 2. Vincular Atividade à Sprint ✅

```
1. Clique em qualquer atividade
2. No modal, vá até "Gestão de Sprint"
3. Selecione a Sprint criada
```

**Resultado esperado:**
- ✅ Atividade vinculada
- ✅ Informações da Sprint aparecem
- ✅ Toast de confirmação

### 3. Visualizar Detalhes da Sprint ✅

```
1. Clique no card da Sprint
2. Modal de detalhes abre
```

**Resultado esperado:**
- ✅ Nome e datas da Sprint
- ✅ Progresso (1/X)
- ✅ Lista de atividades vinculadas

### 4. Finalizar Sprint ✅

```
1. No card da Sprint, clique "Finalizar Sprint"
2. Confirme a ação
```

**Resultado esperado:**
- ✅ Sprint marcada como "Finalizada"
- ✅ Badge verde "Finalizada"
- ✅ Data de fim registrada
- ✅ Toast de confirmação

### 5. Ver Histórico ✅

```
1. Clique na Sprint finalizada
2. Visualize as atividades do histórico
```

**Resultado esperado:**
- ✅ Todas as atividades preservadas
- ✅ Status no momento da finalização

---

## ❓ Troubleshooting

### ⚠️ Erro: "Não foi possível criar sprint"

**Solução:**
1. Verifique se a migração foi aplicada corretamente
2. Abra o Console do navegador (F12)
3. Veja os erros e execute:
   ```bash
   node apply_sprint_migration.js
   ```

### ⚠️ Sprints não aparecem

**Solução:**
1. Verifique se você está logado
2. Recarregue a página (F5)
3. Verifique se há erros no Console (F12)

### ⚠️ Erro ao vincular atividade

**Solução:**
1. Certifique-se de que existe uma Sprint ativa
2. Recarregue a página
3. Tente novamente

---

## 📋 Checklist de Validação

Use esta lista para validar que tudo está funcionando:

- [ ] Migração aplicada no Supabase
- [ ] Servidor reiniciado
- [ ] Consegui criar uma Sprint
- [ ] Sprint aparece no card
- [ ] Consegui vincular uma atividade
- [ ] Consigo visualizar detalhes da Sprint
- [ ] Consegui finalizar a Sprint
- [ ] Sprint finalizada aparece com badge verde
- [ ] Histórico está acessível

**✅ Se todos os itens estão marcados, o sistema está 100% funcional!**

---

## 🎉 Pronto!

O sistema de Sprints está ativo e funcionando!

**Benefícios:**
- ✅ Dados persistidos no Supabase
- ✅ Sincronização em tempo real
- ✅ Interface moderna e responsiva
- ✅ Validações robustas

**Documentação Completa:**
- 📖 `SPRINTS_IMPLEMENTATION_GUIDE.md` - Guia completo
- 📊 `SPRINT_SYSTEM_SUMMARY.md` - Resumo técnico

**Dúvidas?**
Consulte a documentação ou abra o Console do navegador (F12) para ver logs detalhados.

---

**🚀 Bom uso do sistema de Sprints!**

