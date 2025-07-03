
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  domain_slug: string;
  owner_id: string;
  phone: string;
  plan_type: string;
}

interface ClinicContextType {
  currentClinic: Clinic | null;
  loading: boolean;
  setCurrentClinic: (clinic: Clinic) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentClinic, setCurrentClinicState] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const setCurrentClinic = (clinic: Clinic) => {
    setCurrentClinicState(clinic);
  };

  useEffect(() => {
    if (!user || !profile) {
      setCurrentClinicState(null);
      setLoading(false);
      return;
    }

    // Se é superadmin, não precisa de clínica específica
    if (profile.system_role === 'superadmin') {
      setCurrentClinicState(null);
      setLoading(false);
      return;
    }

    const loadClinic = async () => {
      try {
        setLoading(true);
        
        // Verificar se estamos acessando por subdomínio
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        // Se não é localhost e tem subdomínio, tentar carregar por subdomínio
        if (hostname !== 'localhost' && subdomain && subdomain !== 'www') {
          console.log('Loading clinic by subdomain:', subdomain);
          const { data: clinicData, error: clinicError } = await supabase
            .rpc('get_clinic_by_subdomain', { subdomain });
          
          if (clinicError) {
            console.error('Error loading clinic by subdomain:', clinicError);
          } else if (clinicData && clinicData.length > 0) {
            setCurrentClinicState(clinicData[0]);
            setLoading(false);
            return;
          }
        }

        // Carregar clínicas do usuário usando a função get_user_clinics
        console.log('Loading user clinics for user:', user.id);
        const { data: userClinics, error: userClinicsError } = await supabase
          .rpc('get_user_clinics', { user_id: user.id });
        
        if (userClinicsError) {
          console.error('Error loading user clinics:', userClinicsError);
          toast({
            title: "Erro",
            description: "Erro ao carregar clínicas do usuário",
            variant: "destructive",
          });
        } else if (userClinics && userClinics.length > 0) {
          // Usar a primeira clínica disponível
          setCurrentClinicState(userClinics[0]);
        } else {
          console.log('No clinics found for user');
          toast({
            title: "Nenhuma clínica encontrada",
            description: "Você não está associado a nenhuma clínica",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error in loadClinic:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados da clínica",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadClinic();
  }, [user, profile, toast]);

  const value = {
    currentClinic,
    loading,
    setCurrentClinic,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};
