import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  system_role: 'superadmin' | 'clinic_admin' | 'clinic_user' | null;
  plan_type: 'normal' | 'plus' | 'ultra';
  trial_expires_at: string;
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  needsClinicSelection: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<{ error: any }>;
  setClinicSelected: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsClinicSelection, setNeedsClinicSelection] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profileData, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('users_profiles')
            .insert({
              id: userId,
              name: 'Usuário',
              plan_type: 'normal',
              trial_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('Profile created:', newProfile);
            setProfile(newProfile);
          }
        }
      } else {
        console.log('Profile loaded:', profileData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const checkIfNeedsClinicSelection = async (userId: string, userProfile: UserProfile) => {
    // Superadmins não precisam selecionar clínica
    if (userProfile?.system_role === 'superadmin') {
      setNeedsClinicSelection(false);
      return;
    }

    try {
      // Verificar se o usuário tem clínicas associadas
      const { data: userClinics, error } = await supabase
        .rpc('get_user_clinics', { user_id: userId });

      if (error) {
        console.error('Error checking user clinics:', error);
        setNeedsClinicSelection(true);
        return;
      }

      // Se não tem clínicas ou tem mais de uma, precisa selecionar
      if (!userClinics || userClinics.length === 0) {
        setNeedsClinicSelection(true);
      } else if (userClinics.length === 1) {
        // Se tem apenas uma clínica, não precisa selecionar
        setNeedsClinicSelection(false);
      } else {
        // Se tem múltiplas clínicas, precisa selecionar
        setNeedsClinicSelection(true);
      }
    } catch (error) {
      console.error('Error in checkIfNeedsClinicSelection:', error);
      setNeedsClinicSelection(true);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listeners');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
          setNeedsClinicSelection(false);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar necessidade de seleção de clínica quando o perfil é carregado
  useEffect(() => {
    if (user && profile) {
      checkIfNeedsClinicSelection(user.id, profile);
    }
  }, [user, profile]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email não confirmado",
            description: "Verifique seu email e clique no link de confirmação antes de fazer login.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
        } else if (error.message.includes('Too many requests')) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Erro inesperado ao fazer login.",
            variant: "destructive",
          });
        }
      } else if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
      }

      return { error };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting sign up for:', email);
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
          }
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        
        // Mensagens de erro mais específicas para cadastro
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Este email já está registrado. Tente fazer login ou use outro email.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Senha muito fraca",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message || "Erro ao criar conta",
            variant: "destructive",
          });
        }
      } else if (data.user) {
        console.log('Sign up successful for user:', data.user.id);
        
        // Se o usuário foi criado mas não precisa confirmar email
        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta antes de fazer login.",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Conta criada com sucesso. Você já pode fazer login.",
          });
        }
      }

      return { error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string }) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Refresh profile data
        if (user) {
          const { data: profileData } = await supabase
            .from('users_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setNeedsClinicSelection(false);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const setClinicSelected = () => {
    setNeedsClinicSelection(false);
  };

  const isAdmin = profile?.system_role === 'clinic_admin' || profile?.system_role === 'superadmin';
  const isSuperAdmin = profile?.system_role === 'superadmin';

  const value = {
    user,
    session,
    profile,
    loading,
    needsClinicSelection,
    signIn,
    signUp,
    signOut,
    updateProfile,
    setClinicSelected,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
