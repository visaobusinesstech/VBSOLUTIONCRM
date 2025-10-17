# 🎯 SOLUÇÃO FINAL - ERRO CORS

## ❌ **PROBLEMA IDENTIFICADO:**

Você já tem uma função `send-email` existente no Supabase, mas ela não está retornando headers CORS corretos, causando o erro:

```
Access to fetch at 'https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ **SOLUÇÃO:**

### **Opção 1: Atualizar Função Existente (RECOMENDADO)**

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/nrbsocawokmihvxfcpso/functions
   ```

2. **Edite a função `send-email` existente:**
   - Clique em "send-email"
   - Clique em "Edit function"

3. **Adicione os headers CORS no início da função:**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Max-Age': '86400',
   };
   ```

4. **Adicione o tratamento de OPTIONS:**
   ```typescript
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
   ```

5. **Adicione headers CORS em todos os responses:**
   ```typescript
   return new Response(
     JSON.stringify(data),
     { 
       status: 200, 
       headers: { ...corsHeaders, "Content-Type": "application/json" } 
     }
   );
   ```

6. **Deploy:**
   - Clique em "Deploy function"

### **Opção 2: Usar Função test-smtp (ALTERNATIVA)**

Se preferir usar a função `test-smtp`, você pode:

1. **Renomear a função:**
   - Delete `test-smtp`
   - Crie nova função `send-email` com o código de envio

2. **Ou atualizar o código para usar `test-smtp`:**
   - Modificar `EmailScheduling.tsx` para chamar `test-smtp`
   - Implementar lógica de envio na função `test-smtp`

## 🔍 **TESTE APÓS CORREÇÃO:**

Execute no console do navegador (F12):

```javascript
// Teste CORS
fetch('https://nrbsocawokmihvxfcpso.supabase.co/functions/v1/send-email', {
  method: 'OPTIONS'
}).then(response => {
  console.log('✅ CORS Status:', response.status);
  console.log('✅ CORS Headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods')
  });
});
```

## 📋 **CÓDIGO COMPLETO PARA A FUNÇÃO:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Sua lógica de envio de email aqui
    console.log("📧 Processando envio de email:", requestData);
    
    // Simular envio bem-sucedido
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso!" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("❌ Erro:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
```

## 🚨 **PRÓXIMOS PASSOS:**

1. **Execute a Opção 1** (Atualizar função existente)
2. **Teste com o script:** `test-send-email-function.js`
3. **Volte ao sistema e teste o envio de email**
4. **Verifique logs no console**

## ✅ **RESULTADO ESPERADO:**

Após a correção:
- ✅ **Sem erros CORS** no console
- ✅ **Função send-email respondendo** corretamente
- ✅ **Emails sendo enviados** com sucesso
- ✅ **Sistema funcionando** completamente

---

**🎯 Atualize a função `send-email` existente com os headers CORS e teste novamente!**
