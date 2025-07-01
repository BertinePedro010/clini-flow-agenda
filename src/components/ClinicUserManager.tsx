
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserMinus, Shield } from 'lucide-react';

interface UserClinicAssociation {
  id: string;
  user_id: string;
  clinic_id: string;
  role: string;
  is_active: boolean;
  user_name: string;
  clinic_name: string;
}

interface ClinicUserManagerProps {
  clinicId?: string;
}

const ClinicUserManager: React.FC<ClinicUserManagerProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const [associations, setAssociations] = useState<UserClinicAssociation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssociations();
  }, [clinicId]);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('clinic_users')
        .select(`
          *,
          users_profiles!inner(name),
          clinics!inner(name)
        `)
        .order('created_at', { ascending: false });
        
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching associations:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as associações.",
          variant: "destructive",
        });
      } else {
        const mappedData = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          clinic_id: item.clinic_id,
          role: item.role,
          is_active: item.is_active,
          user_name: (item as any).users_profiles.name,
          clinic_name: (item as any).clinics.name,
        }));
        setAssociations(mappedData);
      }
    } catch (error) {
      console.error('Error in fetchAssociations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (associationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clinic_users')
        .update({ is_active: !currentStatus })
        .eq('id', associationId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do usuário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
        });
        fetchAssociations();
      }
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Usuários das Clínicas
        </CardTitle>
        <CardDescription>
          Gerencie o acesso dos usuários às clínicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {associations.map((association) => (
            <div key={association.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{association.user_name}</p>
                  <p className="text-sm text-slate-600">{association.clinic_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={association.role === 'admin' ? 'default' : 'outline'}>
                    {association.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      'Usuário'
                    )}
                  </Badge>
                  <Badge variant={association.is_active ? 'default' : 'destructive'}>
                    {association.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <Button
                  variant={association.is_active ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => toggleUserStatus(association.id, association.is_active)}
                >
                  {association.is_active ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-1" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Ativar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
          
          {associations.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                Nenhuma associação encontrada
              </h3>
              <p className="text-slate-500">
                Não há usuários associados às clínicas ainda.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicUserManager;
