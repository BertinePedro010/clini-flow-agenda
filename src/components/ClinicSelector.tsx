
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  domain_slug: string;
  owner_id: string;
  phone: string;
  plan_type: string;
  user_role: string;
  is_active: boolean;
}

interface ClinicSelectorProps {
  onClinicSelected: (clinic: Clinic) => void;
  showHeader?: boolean;
}

const ClinicSelector: React.FC<ClinicSelectorProps> = ({ 
  onClinicSelected, 
  showHeader = true 
}) => {
  const { user, setClinicSelected } = useAuth();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserClinics();
    }
  }, [user]);

  const fetchUserClinics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_user_clinics', { user_id: user.id });

      if (error) {
        console.error('Error fetching user clinics:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas clínicas.",
          variant: "destructive",
        });
      } else {
        setClinics(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUserClinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinicId(clinic.id);
    onClinicSelected(clinic);
    setClinicSelected();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando suas clínicas...</p>
        </div>
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Nenhuma Clínica Encontrada
            </CardTitle>
            <CardDescription>
              Você não tem acesso a nenhuma clínica no momento. Entre em contato com o administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {showHeader && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Selecione uma Clínica
            </h1>
            <p className="text-slate-600">
              Escolha a clínica que deseja acessar para trabalhar
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <Card 
              key={clinic.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedClinicId === clinic.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleClinicSelect(clinic)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  {selectedClinicId === clinic.id && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                
                <h3 className="font-semibold text-slate-800 mb-2">
                  {clinic.name}
                </h3>
                
                <div className="space-y-1 text-sm text-slate-600">
                  <p>Plano: <span className="capitalize">{clinic.plan_type}</span></p>
                  <p>Seu papel: <span className="capitalize">{clinic.user_role}</span></p>
                  {clinic.phone && (
                    <p>Telefone: {clinic.phone}</p>
                  )}
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  Selecionar Clínica
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicSelector;
