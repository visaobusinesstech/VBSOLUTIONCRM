# 🔧 CORRIGIR ERRO CORS - Edge Function

## ❌ **PROBLEMA IDENTIFICADO:**

```
Access to fetch at 'https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🎯 **SOLUÇÃO:**

### **Opção 1: Deploy Manual da Edge Function (RECOMENDADO)**

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/nrbsocawokmihvxfcpso/functions
   ```

2. **Delete a Edge Function existente (se existir):**
   - Clique em "send-email"
   - Clique em "Delete function"

3. **Crie uma nova Edge Function:**
   - Clique em "Create a new function"
   - Nome: `send-email`
   - Runtime: `Deno`

4. **Cole o código corrigido:**
   - Abra o arquivo: `send-email-bundle.ts` (criado automaticamente)
   - Copie todo o conteúdo
   - Cole na Edge Function

5. **Deploy:**
   - Clique em "Deploy function"

### **Opção 2: Deploy via CLI (Alternativa)**

```bash
# No terminal, dentro da pasta frontend:
cd frontend
npx supabase functions deploy send-email --no-verify-jwt
```

### **Opção 3: Verificar se já existe**

1. **Acesse:** https://supabase.com/dashboard/project/nrbsocawokmihvxfcpso/functions
2. **Verifique se `send-email` existe**
3. **Se existir, teste com:**
   ```javascript
   // No console do navegador:
   fetch('https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email', {
     method: 'OPTIONS',
     headers: {
       'Access-Control-Request-Method': 'POST',
       'Access-Control-Request-Headers': 'authorization, content-type'
     }
   }).then(response => {
     console.log('CORS Response:', response.headers.get('Access-Control-Allow-Origin'));
   });
   ```

## 🔍 **VERIFICAÇÕES:**

### **1. Testar CORS:**
```javascript
// Execute no console do navegador:
fetch('https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email', {
  method: 'OPTIONS'
}).then(response => {
  console.log('Status:', response.status);
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
  });
});
```

### **2. Testar Edge Function:**
```javascript
// Execute no console do navegador:
fetch('https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token
  },
  body: JSON.stringify({
    to: 'teste@exemplo.com',
    subject: 'Teste CORS',
    content: 'Teste de envio',
    smtp_settings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      password: 'test',
      from_name: 'Teste',
      from_email: 'test@gmail.com'
    },
    use_smtp: true
  })
}).then(response => {
  console.log('Response Status:', response.status);
  return response.json();
}).then(data => {
  console.log('Response Data:', data);
});
```

## 📋 **CÓDIGO DA EDGE FUNCTION CORRIGIDA:**

A Edge Function já foi corrigida com headers CORS adequados:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};
```

## 🚨 **PRÓXIMOS PASSOS:**

1. **Execute a Opção 1** (Deploy Manual)
2. **Teste com os scripts de verificação**
3. **Volte ao sistema e teste o envio de email**
4. **Verifique logs no console do navegador**

## ✅ **RESULTADO ESPERADO:**

Após o deploy correto, você deve ver:
- ✅ Sem erros CORS no console
- ✅ Edge Function respondendo corretamente
- ✅ Emails sendo enviados com sucesso

---

**🎯 Execute o deploy manual e teste novamente o envio de emails!**
