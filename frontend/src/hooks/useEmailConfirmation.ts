import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const useEmailConfirmation = () => {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Verificar se há um usuário logado
    const checkUser = async () => {
      if (!isMounted.current) return;
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Erro ao verificar usuário:', error);
          return;
        }

        if (user && user.email_confirmed_at && !hasRedirected.current && isMounted.current) {
          console.log('✅ Email confirmado! Redirecionando para home...');
          hasRedirected.current = true;
          
          // Usar window.location para evitar problemas de DOM
          setTimeout(() => {
            if (isMounted.current) {
              window.location.href = '/';
            }
          }, 200);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      }
    };

    // Verificar imediatamente
    checkUser();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;
        
        console.log('🔄 Mudança no estado de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !hasRedirected.current && isMounted.current) {
          console.log('✅ Usuário logado e email confirmado!');
          hasRedirected.current = true;
          
          // Usar window.location para evitar problemas de DOM
          setTimeout(() => {
            if (isMounted.current) {
              window.location.href = '/';
            }
          }, 200);
        }
      }
    );

    // Cleanup
    return () => {
      isMounted.current = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
};
