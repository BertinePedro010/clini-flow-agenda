
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Ban, Trash2, ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
      return;
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      } else {
        // Map the data to match our interface
        const mappedUsers: UserProfile[] = (data || []).map(user => ({
          id: user.id,
          name: user.name,
          role: 'user' as 'user' | 'admin', // Default since users_profiles doesn't have role
          status: 'active' as 'active' | 'blocked', // Default since users_profiles doesn't have status
          created_at: user.created_at,
          updated_at: user.updated_at
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      
      // For now, we'll just show a message since the users_profiles table doesn't have status
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A funcionalidade de bloquear/desbloquear usuários será implementada em breve.",
      });
    } catch (error) {
      console.error('Error in handleBlockUser:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o usuário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Usuário removido com sucesso.",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="destructive">
        Bloqueado
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="default" className="bg-purple-100 text-purple-800">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <Users className="w-3 h-3 mr-1" />
        Usuário
      </Badge>
    );
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Administração de Usuários
              </h1>
              <p className="text-slate-600">
                Gerencie todos os usuários do sistema
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {users.map((userProfile) => (
            <Card key={userProfile.id} className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {userProfile.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cadastrado em: {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end space-y-2">
                      {getRoleBadge(userProfile.role)}
                      {getStatusBadge(userProfile.status)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={userProfile.status === 'active' ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleBlockUser(userProfile.id, userProfile.status)}
                        disabled={userProfile.id === user?.id}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        {userProfile.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(userProfile.id)}
                        disabled={userProfile.id === user?.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Card className="medical-card">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-slate-500">
                  Não há usuários cadastrados no sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
