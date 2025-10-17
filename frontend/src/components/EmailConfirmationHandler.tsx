import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const EmailConfirmationHandler = () => {
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (hasChecked.current) return;
      hasChecked.current = true;

      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Erro ao verificar usuário:', error);
          return;
        }

        if (user && user.email_confirmed_at) {
          console.log('✅ Email confirmado! Redirecionando para login...');
          
          // Usar window.location para evitar problemas de DOM
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao verificar confirmação de email:', error);
      }
    };

    // Verificar imediatamente
    checkEmailConfirmation();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Mudança no estado de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('✅ Usuário logado e email confirmado!');
          
          // Usar window.location para evitar problemas de DOM
          setTimeout(() => {
            window.location.href = '/login';
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
