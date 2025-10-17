import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    console.warn('⚠️ useUser está sendo chamado fora do UserProvider. Retornando contexto vazio.');
    // Retornar um contexto vazio ao invés de lançar erro
    return {
      userName: '',
      setUserName: () => {},
      userEmail: '',
      setUserEmail: () => {},
      userAvatar: '',
      setUserAvatar: () => {},
      refreshUserData: async () => {}
    };
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userName, setUserName] = useState(() => {
    // Limpar localStorage antigo e buscar do Supabase
    localStorage.removeItem('userName');
    return '';
  });

  const [userEmail, setUserEmail] = useState(() => {
    const saved = localStorage.getItem('userEmail');
    return saved || '';
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    const saved = localStorage.getItem('userAvatar');
    return saved || '';
  });

  // Função para buscar dados do perfil do Supabase
  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erro ao obter usuário autenticado:', userError);
        return;
      }

      // Buscar perfil na tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return;
      }

      if (profile) {
        console.log('✅ UserContext: Perfil encontrado:', profile);
        // Atualizar os estados com os dados do Supabase
        if (profile.name) {
          console.log('✅ UserContext: Definindo nome do perfil:', profile.name);
          setUserName(profile.name);
          localStorage.setItem('userName', profile.name);
        } else {
          // Fallback: usar nome do user_metadata ou email
          const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
          console.log('⚠️ UserContext: Usando nome fallback:', fallbackName);
          setUserName(fallbackName);
          localStorage.setItem('userName', fallbackName);
        }
        
        if (profile.email) {
          setUserEmail(profile.email);
          localStorage.setItem('userEmail', profile.email);
        }
        
        if (profile.avatar_url) {
          setUserAvatar(profile.avatar_url);
          localStorage.setItem('userAvatar', profile.avatar_url);
        }
      } else {
        // Se não há perfil, usar dados do auth
        const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
        console.log('⚠️ UserContext: Sem perfil, usando dados do auth:', fallbackName);
        setUserName(fallbackName);
        localStorage.setItem('userName', fallbackName);
        
        setUserEmail(user.email || '');
        localStorage.setItem('userEmail', user.email || '');
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
    }
  };

  // Função para atualizar dados do usuário
  const refreshUserData = async () => {
    await fetchUserProfile();
  };

  // Carregar dados do perfil quando o componente for montado
  useEffect(() => {
    console.log('🔄 UserContext: Carregando dados do usuário...');
    fetchUserProfile();
  }, []);

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userAvatar) {
      localStorage.setItem('userAvatar', userAvatar);
    }
  }, [userAvatar]);

  const value: UserContextType = {
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userAvatar,
    setUserAvatar,
    refreshUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
