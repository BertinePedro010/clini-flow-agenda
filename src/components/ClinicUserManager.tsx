
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserMinus, Shield, Building2 } from 'lucide-react';
import AddUserToClinicDialog from './AddUserToClinicDialog';

interface UserClinicAssociation {
  id: string;
  user_id: string;
  clinic_id: string;
  role: string;
  is_active: boolean;
  user_name: string;
  clinic_name: string;
}

interface Clinic {
  id: string;
  name: string;
}

interface ClinicUserManagerProps {
  clinicId?: string;
}

const ClinicUserManager: React.FC<ClinicUserManagerProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const [associations, setAssociations] = useState<UserClinicAssociation[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(clinicId || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      fetchAssociations();
    }
  }, [selectedClinicId]);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching clinics:', error);
      } else {
        setClinics(data || []);
        if (!selectedClinicId && data && data.length > 0) {
          setSelectedClinicId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error in fetchClinics:', error);
    }
  };

  const fetchAssociations = async () => {
    if (!selectedClinicId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_clinic_users', { clinic_id_param: selectedClinicId });

      if (error) {
        console.error('Error fetching associations:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários da clínica.",
          variant: "destructive",
        });
      } else {
        const mappedData = (data || []).map(item => ({
          id: item.id,
          user_id: item.id,
          clinic_id: selectedClinicId,
          role: item.role,
          is_active: item.is_active,
          user_name: item.name,
          clinic_name: clinics.find(c => c.id === selectedClinicId)?.name || '',
        }));
        setAssociations(mappedData);
      }
    } catch (error) {
      console.error('Error in fetchAssociations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clinic_users')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId)
        .eq('clinic_id', selectedClinicId);

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

  const selectedClinic = clinics.find(c => c.id === selectedClinicId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Gerenciar Usuários das Clínicas
            </div>
            {selectedClinic && (
              <AddUserToClinicDialog
                clinicId={selectedClinic.id}
                clinicName={selectedClinic.name}
                onUserAdded={fetchAssociations}
              />
            )}
          </CardTitle>
          <CardDescription>
            Gerencie o acesso dos usuários às clínicas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selecionar Clínica
            </label>
            <Select value={selectedClinicId || ''} onValueChange={setSelectedClinicId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma clínica" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      {clinic.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {associations.map((association) => (
                <div key={association.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{association.user_name}</p>
                      <p className="text-sm text-slate-600">{selectedClinic?.name}</p>
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
                      onClick={() => toggleUserStatus(association.user_id, association.is_active)}
                    >
                      {association.is_active ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 mr-1" />
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
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-slate-500">
                    {selectedClinic 
                      ? `Não há usuários associados à clínica "${selectedClinic.name}" ainda.`
                      : 'Selecione uma clínica para ver os usuários associados.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicUserManager;
