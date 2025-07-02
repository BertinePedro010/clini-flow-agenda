
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User, Calendar, Crown, Shield, UserCheck } from 'lucide-react';

const Profile = () => {
  const { user, profile } = useAuth();
  const { currentClinic } = useClinic();

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="w-4 h-4" />;
      case 'clinic_admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrador';
      case 'clinic_admin':
        return 'Administrador da Clínica';
      default:
        return 'Usuário';
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'plus':
        return 'Plano Plus';
      case 'ultra':
        return 'Plano Ultra';
      default:
        return 'Plano Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Perfil do Usuário</h1>
        <p className="text-slate-600">Visualize suas informações pessoais e da clínica</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Seus dados pessoais e status na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Cargo</label>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon(profile.system_role)}
                  <span className="text-sm">{getRoleLabel(profile.system_role)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Plano</label>
                <div className="mt-1">
                  <Badge variant="outline">{getPlanLabel(profile.plan_type)}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Membro desde</label>
                <p className="text-sm mt-1">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Teste expira em</label>
                <p className="text-sm mt-1">{formatDate(profile.trial_expires_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações da Clínica
            </CardTitle>
            <CardDescription>
              Dados da clínica vinculada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentClinic ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold">{currentClinic.name}</h3>
                  <p className="text-slate-600">ID: {currentClinic.id}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Telefone</label>
                    <p className="text-sm mt-1">{currentClinic.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Domínio</label>
                    <p className="text-sm mt-1">
                      {currentClinic.domain_slug ? 
                        `${currentClinic.domain_slug}.clinica.com` : 
                        'Não configurado'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Plano da Clínica</label>
                    <div className="mt-1">
                      <Badge variant="secondary">{getPlanLabel(currentClinic.plan_type)}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Proprietário</label>
                    <p className="text-sm mt-1">
                      {currentClinic.owner_id === user.id ? 'Você' : 'Outro usuário'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhuma clínica vinculada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
