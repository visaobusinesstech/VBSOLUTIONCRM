# 🧪 Guia de Teste - Integração Google Calendar

## ✅ Status da Implementação

### **Backend (Porta 3000)**
- ✅ Servidor funcionando
- ✅ Endpoints de autenticação Google
- ✅ Endpoints do AI Agent para Google Calendar
- ✅ Persistência de conexões em JSON
- ✅ Tratamento de erros

### **Frontend**
- ✅ Hook `useGoogleCalendar.ts` criado
- ✅ Hook `useCalendar.ts` atualizado com integração
- ✅ Componente `ModernCalendar.tsx` com indicadores visuais
- ✅ Botões de conexão/desconexão
- ✅ Badges para eventos do Google

---

## 🚀 Como Testar a Integração

### **1. Testar Conexão Google**

1. **Acesse o calendário:**
   ```
   http://localhost:5173/calendar
   ```

2. **Clique em "Conectar Google"** no header do calendário

3. **Autorize no Google OAuth:**
   - Será redirecionado para o Google
   - Autorize as permissões
   - Será redirecionado de volta

4. **Verifique o status:**
   - Deve aparecer "Google Conectado" no header
   - Badge verde com ícone do Globe

### **2. Testar Busca de Eventos**

1. **Com Google conectado:**
   - Os eventos do Google aparecerão no calendário
   - Eventos do Google terão badge "Google" azul
   - Eventos locais aparecerão normalmente

2. **Verificar no console:**
   ```javascript
   // Abrir DevTools e executar:
   console.log('Eventos:', window.__events);
   console.log('Google conectado:', window.__googleConnected);
   ```

### **3. Testar Criação de Eventos**

1. **Criar evento local:**
   - Clique em uma data no calendário
   - Preencha os dados
   - Marque "Sincronizar com Google" (se conectado)
   - Salve o evento

2. **Verificar sincronização:**
   - Evento deve aparecer no Google Calendar
   - Evento local deve ter badge "Google"

### **4. Testar AI Agent**

1. **Usar o hook `useGoogleCalendarAI`:**
   ```typescript
   import { useGoogleCalendarAI } from '@/hooks/useGoogleCalendarAI';
   
   const { createEvent, processAICommand } = useGoogleCalendarAI();
   
   // Criar evento via AI Agent
   await processAICommand('criar reunião amanhã às 14h', {
     title: 'Reunião Cliente',
     start: '2024-10-16T14:00:00',
     end: '2024-10-16T15:00:00'
   });
   ```

2. **Comandos suportados:**
   - "criar evento", "agendar", "marcar reunião"
   - "atualizar evento", "editar", "modificar"
   - "deletar evento", "remover", "cancelar"
   - "listar eventos", "mostrar agenda", "ver calendário"

---

## 🔧 Endpoints Disponíveis

### **Autenticação Google**
```bash
# Verificar status
GET http://localhost:3000/api/integrations/google/status

# Iniciar conexão
GET http://localhost:3000/api/integrations/google/auth

# Desconectar
POST http://localhost:3000/api/integrations/google/disconnect
```

### **AI Agent - Google Calendar**
```bash
# Listar eventos
GET http://localhost:3000/api/ai-agent/google-calendar/list-events

# Criar evento
POST http://localhost:3000/api/ai-agent/google-calendar/create-event
{
  "title": "Reunião Cliente",
  "description": "Reunião de vendas",
  "start": "2024-10-16T14:00:00Z",
  "end": "2024-10-16T15:00:00Z",
  "attendees": ["cliente@exemplo.com"]
}

# Atualizar evento
PUT http://localhost:3000/api/ai-agent/google-calendar/update-event/{eventId}
{
  "title": "Reunião Atualizada",
  "description": "Nova descrição"
}

# Deletar evento
DELETE http://localhost:3000/api/ai-agent/google-calendar/delete-event/{eventId}
```

---

## 🎨 Interface Visual

### **Header do Calendário**
- **Não conectado:** Botão azul "Conectar Google"
- **Conectado:** Badge verde "Google Conectado" + botão "Desconectar"

### **Eventos no Calendário**
- **Evento local:** Badge normal com tipo (Reunião, Ligação, etc.)
- **Evento Google:** Badge azul "Google" + ícone Globe

### **Indicadores de Status**
- ✅ Verde: Google conectado
- 🔵 Azul: Evento sincronizado com Google
- ⚪ Branco: Evento local

---

## 🐛 Troubleshooting

### **Erro: "Google não conectado"**
- Verifique se clicou em "Conectar Google"
- Verifique se autorizou no Google OAuth
- Verifique se o servidor está rodando na porta 3000

### **Eventos não aparecem**
- Verifique se está conectado ao Google
- Verifique o console do navegador para erros
- Teste os endpoints diretamente

### **Erro de CORS**
- O servidor já está configurado com CORS
- Se persistir, verifique se está acessando localhost:5173

### **Erro de JSON parsing**
- Verifique se o servidor está rodando
- Verifique se as rotas estão registradas
- Verifique se não há conflito de portas

---

## 📊 Verificação de Funcionamento

### **Checklist de Testes**

- [ ] Servidor rodando na porta 3000
- [ ] Frontend rodando na porta 5173
- [ ] Botão "Conectar Google" visível
- [ ] Redirecionamento para Google OAuth funciona
- [ ] Autorização no Google funciona
- [ ] Redirecionamento de volta funciona
- [ ] Badge "Google Conectado" aparece
- [ ] Eventos do Google aparecem no calendário
- [ ] Eventos do Google têm badge "Google"
- [ ] Criação de evento com sincronização funciona
- [ ] AI Agent responde aos comandos
- [ ] Desconexão funciona

### **Comandos de Teste Rápido**

```bash
# 1. Verificar servidor
curl http://localhost:3000/health

# 2. Verificar status Google
curl http://localhost:3000/api/integrations/google/status

# 3. Testar criação de evento (após conectar)
curl -X POST http://localhost:3000/api/ai-agent/google-calendar/create-event \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste","start":"2024-10-16T14:00:00Z","end":"2024-10-16T15:00:00Z"}'
```

---

## 🎯 Resultado Esperado

Após implementar e testar, você deve ter:

✅ **Calendário funcional** com eventos locais e do Google  
✅ **Sincronização bidirecional** entre sistemas  
✅ **Indicadores visuais** claros para eventos Google  
✅ **AI Agent integrado** para comandos em linguagem natural  
✅ **Interface intuitiva** para conectar/desconectar Google  
✅ **Tratamento de erros** robusto  

---

**Status:** ✅ **IMPLEMENTAÇÃO COMPLETA**  
**Data:** 14 de Outubro de 2025  
**Próximo passo:** Testar a integração no navegador! 🚀
