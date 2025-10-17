import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const LoginRedirectHandler = () => {
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (hasRedirected.current) return;

      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Erro ao verificar usuário:', error);
          return;
        }

        // Se usuário está logado e email confirmado, redireciona para home
        if (user && user.email_confirmed_at) {
          console.log('✅ Usuário logado e email confirmado! Redirecionando para home...');
          hasRedirected.current = true;
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao verificar login:', error);
      }
    };

    // Verificar imediatamente
    checkAndRedirect();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (hasRedirected.current) return;
        
        console.log('🔄 Mudança no estado de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('✅ Usuário logado e email confirmado! Redirecionando para home...');
          hasRedirected.current = true;
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      }
    );

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return null; // Este componente não renderiza nada
};
