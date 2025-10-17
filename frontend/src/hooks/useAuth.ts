import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const auth = useAuthContext();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema.",
      });

      return { data };
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpCompany = async (registerData: {
    name: string;
    companyName: string;
    companyPhone: string;
    position: string;
    employeesCount: string;
    businessNiche: string;
    targetAudience: string;
    email: string;
    password: string;
  }) => {
    try {
      console.log('🚀 Iniciando cadastro de empresa:', registerData);
      
      // 1. Criar usuário no Supabase Auth (com autoConfirm para permitir login imediato)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            company: registerData.companyName,
            phone: registerData.companyPhone,
            position: registerData.position,
            employees_count: registerData.employeesCount,
            business_niche: registerData.businessNiche,
            target_audience: registerData.targetAudience
          },
          emailRedirectTo: `${window.location.origin}/` // Redireciona para Home após confirmação de email
        }
      });

      if (authError) {
        console.error('❌ Erro no cadastro Supabase Auth:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError };
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);
      console.log('📧 Email de verificação enviado para:', registerData.email);

      // 2. Gerar owner_id único para a empresa
      const ownerId = authData.user.id; // Usando o ID do usuário como owner_id
      console.log('🏢 Owner ID gerado:', ownerId);

      // 3. Criar usuário administrador na tabela company_users com todos os dados da empresa
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .insert([
          {
            company_id: ownerId, // Usando o owner_id como company_id
            owner_id: ownerId, // Adicionando owner_id para isolamento
            full_name: registerData.name,
            email: registerData.email,
            password_hash: registerData.password, // Em produção, isso deve ser hash
            phone: registerData.companyPhone,
            company_name: registerData.companyName, // Nome da empresa
            position: registerData.position, // Cargo
            employees_count: registerData.employeesCount, // Quantidade de funcionários
            business_niche: registerData.businessNiche, // Nicho da empresa
            target_audience: registerData.targetAudience, // Público-alvo
            role: 'admin', // Definindo como administrador
            status: 'active'
          }
        ] as any)
        .select()
        .single() as any;

      if (companyUserError) {
        console.error('❌ Erro ao criar administrador da empresa:', companyUserError);
        toast({
          title: "Erro ao criar administrador",
          description: "Erro ao registrar dados do administrador da empresa.",
          variant: "destructive",
        });
        return { error: companyUserError };
      }

      console.log('✅ Administrador da empresa criado:', companyUserData.id);

      // 4. Criar empresa na tabela companies
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            owner_id: ownerId,
            fantasy_name: registerData.companyName,
            company_name: registerData.companyName,
            email: registerData.email,
            phone: registerData.companyPhone,
            sector: registerData.businessNiche,
            status: 'active',
            settings: {
              employees_count: registerData.employeesCount,
              target_audience: registerData.targetAudience
            }
          }
        ] as any)
        .select()
        .single() as any;

      if (companyError) {
        console.warn('⚠️ Erro ao criar empresa na tabela companies:', companyError);
        // Não vamos bloquear o cadastro por causa disso
      } else {
        console.log('✅ Empresa criada na tabela companies:', companyData.id);
      }

      // 5. Criar perfil na tabela profiles com owner_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            owner_id: ownerId, // Adicionando owner_id para isolamento
            company_id: companyData?.id || null, // Vinculando ao ID da empresa
            email: registerData.email,
            name: registerData.name,
            company: registerData.companyName,
            phone: registerData.companyPhone,
            position: registerData.position
          }
        ] as any)
        .select()
        .single() as any;

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        toast({
          title: "Aviso",
          description: "Empresa criada, mas perfil não foi criado automaticamente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Perfil criado:', profileData);
      }

      console.log('🎉 CADASTRO REALIZADO COM SUCESSO!');
      console.log('🏢 Empresa registrada:', registerData.companyName);
      console.log('👤 Usuário administrador criado');
      console.log('📧 Email de verificação enviado');

      // 6. Fazer login automático após o registro (se a sessão foi criada)
      if (authData.session) {
        console.log('✅ Sessão criada automaticamente, usuário pode acessar o sistema');
        toast({
          title: "Cadastro realizado com sucesso!",
          description: `Bem-vindo ao sistema! Um email de verificação foi enviado para ${registerData.email}`,
        });
      } else {
        console.log('⚠️ Sessão não criada, usuário precisa confirmar email primeiro');
        toast({
          title: "Cadastro realizado!",
          description: `Verifique seu email ${registerData.email} para ativar sua conta.`,
        });
      }

      return { 
        data: {
          user: authData.user,
          session: authData.session,
          company: companyData,
          companyUser: companyUserData,
          profile: profileData,
          ownerId: ownerId
        }
      };

    } catch (error) {
      console.error('❌ Erro inesperado no cadastro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('🚀 Iniciando cadastro de usuário:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro Supabase:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Usuário criado no Supabase Auth:', data.user?.id);

      // Se o cadastro foi bem-sucedido, criar o perfil na tabela profiles
      if (data.user) {
        try {
          console.log('📝 Criando perfil na tabela profiles...');
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: userData.name || '',
                company: userData.company || '',
              }
            ] as any)
            .select()
            .single();

          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            toast({
              title: "Aviso",
              description: "Conta criada, mas perfil não foi criado automaticamente. Entre em contato com o suporte.",
              variant: "destructive",
            });
          } else {
            console.log('✅ Perfil criado com sucesso:', profileData);
          }
        } catch (profileError) {
          console.error('❌ Erro inesperado ao criar perfil:', profileError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas perfil não foi criado automaticamente. Entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { data };
    } catch (error) {
      console.error('❌ Erro inesperado no cadastro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      // Redirecionar para login após logout
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao enviar o email.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Função para obter o perfil do usuário logado
  const getProfile = async () => {
    try {
      console.log('🔍 getProfile: Iniciando busca de perfil...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ getProfile: Erro ao obter usuário:', userError);
        return { profile: null, error: userError.message };
      }
      
      if (!user) {
        console.log('❌ getProfile: Nenhum usuário autenticado');
        return { profile: null, error: 'Usuário não autenticado' };
      }
      
      console.log('✅ getProfile: Usuário autenticado:', user.id, user.email);
      
      // Verificar se a tabela profiles existe
      console.log('🔍 getProfile: Verificando tabela profiles...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, company_id')
            .eq('id', user.id)
            .single();

      if (profileError) {
        console.error('❌ getProfile: Erro ao buscar perfil na tabela:', profileError);
        
        // Se a tabela não existir, vamos tentar criar um perfil básico
        if (profileError.code === 'PGRST116') {
          console.log('🔄 getProfile: Tabela profiles não encontrada, tentando criar perfil...');
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
                  company: user.user_metadata?.company || '',
                }
              ] as any)
              .select()
              .single();
            
            if (createError) {
              console.error('❌ getProfile: Erro ao criar perfil:', createError);
              return { profile: null, error: `Erro ao criar perfil: ${createError.message}` };
            }
            
            console.log('✅ getProfile: Perfil criado com sucesso:', newProfile);
            return { profile: newProfile, error: null };
          } catch (createErr) {
            console.error('❌ getProfile: Erro inesperado ao criar perfil:', createErr);
            return { profile: null, error: 'Erro inesperado ao criar perfil' };
          }
        }
        
        return { profile: null, error: profileError.message };
      }

      console.log('✅ getProfile: Perfil encontrado:', profile);
      return { profile, error: null };
    } catch (error) {
      console.error('❌ getProfile: Erro inesperado:', error);
      return { profile: null, error: error instanceof Error ? error.message : 'Erro inesperado' };
    }
  };

  // Função para atualizar o perfil do usuário
  const updateProfile = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
        .select()
        .single() as any;

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });

      return { data, error: null };
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signInCompanyUser = async (email: string, password: string) => {
    try {
      if (!auth.signInCompanyUser) {
        throw new Error('Função de login da empresa não disponível');
      }
      
      const result = await auth.signInCompanyUser(email, password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema.",
        });
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Email ou senha incorretos",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro interno';
      toast({
        title: "Erro no login",
        description: error,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Função para cadastrar usuário dentro da empresa
  const createCompanyUser = async (userData: {
    name: string;
    email: string;
    password: string;
    position: string;
    phone?: string;
  }) => {
    try {
      console.log('🚀 Criando usuário da empresa:', userData);
      
      // 1. Obter o owner_id do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // 2. Buscar o owner_id do usuário logado
      // Primeiro tentar buscar em company_users (se for admin/dono)
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('owner_id, company_name')
        .eq('email', user.email)
        .single() as any;

      let ownerId: string;
      let companyName: string;

      if (!companyError && companyData && companyData.owner_id) {
        // Encontrou em company_users (usuário é admin/dono)
        ownerId = companyData.owner_id;
        companyName = companyData.company_name;
        console.log('✅ Owner ID encontrado em company_users:', ownerId);
      } else {
        // Não encontrou em company_users, buscar em profiles (se for usuário cadastrado)
        console.log('⚠️ Não encontrado em company_users, buscando em profiles...');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('owner_id, company')
          .eq('id', user.id)
          .single() as any;

        if (profileError || !profileData || !profileData.owner_id) {
          console.error('❌ Erro ao buscar dados da empresa:', profileError);
          throw new Error('Empresa não encontrada. Certifique-se de que você está logado com uma conta válida.');
        }

        ownerId = profileData.owner_id;
        companyName = profileData.company;
        console.log('✅ Owner ID encontrado em profiles:', ownerId);
      }
      console.log('🏢 Owner ID da empresa:', ownerId);
      console.log('🏢 Nome da empresa:', companyName);

      // 3. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            company: companyName,
            phone: userData.phone,
            position: userData.position
          }
        }
      });

      if (authError) {
        console.error('❌ Erro no cadastro Supabase Auth:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError };
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);

      // 4. Criar na tabela company_users com o mesmo owner_id
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .insert([
          {
            owner_id: ownerId, // Mesmo owner_id da empresa
            full_name: userData.name,
            email: userData.email,
            password_hash: userData.password,
            phone: userData.phone || '',
            position: userData.position,
            company_name: companyName,
            role: 'user', // Usuário comum (não admin)
            status: 'active'
          }
        ] as any)
        .select()
        .single() as any;

      if (companyUserError) {
        console.error('❌ Erro ao criar em company_users:', companyUserError);
        // Não vamos bloquear se falhar, pois o importante é o profiles
      } else {
        console.log('✅ Usuário criado em company_users:', companyUserData);
      }

      // 5. Criar na tabela profiles com o mesmo owner_id
      const { data: newProfileData, error: newProfileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            owner_id: ownerId, // Mesmo owner_id da empresa
            email: userData.email,
            name: userData.name,
            company: companyName,
            phone: userData.phone || '',
            position: userData.position
          }
        ] as any)
        .select()
        .single() as any;

      if (newProfileError) {
        console.error('❌ Erro ao criar perfil:', newProfileError);
        toast({
          title: "Erro ao criar perfil",
          description: "Erro ao criar o perfil do usuário na empresa.",
          variant: "destructive",
        });
        return { error: newProfileError };
      }

      console.log('✅ Perfil criado com sucesso:', newProfileData);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${userData.name} foi adicionado à sua empresa.`,
      });

      return { 
        data: {
          user: authData.user,
          companyUser: companyUserData,
          profile: newProfileData,
          ownerId: ownerId
        }
      };

    } catch (error) {
      console.error('❌ Erro inesperado ao criar usuário:', error);
      toast({
        title: "Erro inesperado",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante a criação do usuário.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    ...auth,
    signIn,
    signUp,
    signUpCompany,
    createCompanyUser,
    signOut,
    resetPassword,
    signInCompanyUser,
    getProfile,
    updateProfile,
  };
} 
