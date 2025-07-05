
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ClinicUserManager from '@/components/ClinicUserManager';
import UserMenu from '@/components/UserMenu';
import ClinicCard from '@/components/admin/ClinicCard';
import ClinicForm from '@/components/admin/ClinicForm';
import AdminStats from '@/components/admin/AdminStats';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  domain_slug: string;
  owner_id: string;
  phone: string;
  plan_type: string;
  created_at: string;
}

const SuperAdmin = () => {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalUsers: 0,
    activeAppointments: 0,
    monthlyGrowth: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plan_type: 'normal',
    domain_slug: ''
  });

  useEffect(() => {
    fetchClinics();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Buscar estatísticas gerais
      const [clinicsResult, usersResult, appointmentsResult] = await Promise.all([
        supabase.from('clinics').select('id', { count: 'exact' }),
        supabase.from('users_profiles').select('id', { count: 'exact' }),
        supabase.from('appointments_schedule')
          .select('id', { count: 'exact' })
          .gte('appointment_date', new Date().toISOString().split('T')[0])
      ]);

      setStats({
        totalClinics: clinicsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeAppointments: appointmentsResult.count || 0,
        monthlyGrowth: 12 // Valor mock para demonstração
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clinics:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as clínicas.",
          variant: "destructive",
        });
      } else {
        setClinics(data || []);
      }
    } catch (error) {
      console.error('Error in fetchClinics:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar clínicas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueSlug = async (name: string) => {
    try {
      const { data, error } = await supabase
        .rpc('generate_unique_slug', { clinic_name: name });

      if (error) {
        console.error('Error generating slug:', error);
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      return data;
    } catch (error) {
      console.error('Error in generateUniqueSlug:', error);
      return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClinic) {
        // Atualizar clínica existente
        const { error } = await supabase
          .from('clinics')
          .update({
            name: formData.name,
            phone: formData.phone,
            plan_type: formData.plan_type,
            domain_slug: formData.domain_slug
          })
          .eq('id', editingClinic.id);

        if (error) {
          console.error('Error updating clinic:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a clínica.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Clínica atualizada com sucesso.",
          });
          fetchClinics();
          fetchStats();
          setIsDialogOpen(false);
          resetForm();
        }
      } else {
        // Criar nova clínica
        const slug = await generateUniqueSlug(formData.name);
        
        const { error } = await supabase
          .from('clinics')
          .insert({
            name: formData.name,
            slug: slug,
            phone: formData.phone,
            plan_type: formData.plan_type,
            domain_slug: formData.domain_slug || slug,
            owner_id: 'temp-owner'
          });

        if (error) {
          console.error('Error creating clinic:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar a clínica.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Clínica criada com sucesso.",
          });
          fetchClinics();
          fetchStats();
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar solicitação.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      phone: clinic.phone || '',
      plan_type: clinic.plan_type,
      domain_slug: clinic.domain_slug || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (clinicId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('clinics')
          .delete()
          .eq('id', clinicId);

        if (error) {
          console.error('Error deleting clinic:', error);
          toast({
            title: "Erro",
            description: "Não foi possível excluir a clínica.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Clínica excluída com sucesso.",
          });
          fetchClinics();
          fetchStats();
        }
      } catch (error) {
        console.error('Error in handleDelete:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      plan_type: 'normal',
      domain_slug: ''
    });
    setEditingClinic(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
          <p className="text-sm text-slate-500">Administração geral do sistema</p>
        </div>
        <UserMenu />
      </div>

      {/* Stats Dashboard */}
      {!statsLoading && (
        <AdminStats
          totalClinics={stats.totalClinics}
          totalUsers={stats.totalUsers}
          activeAppointments={stats.activeAppointments}
          monthlyGrowth={stats.monthlyGrowth}
        />
      )}

      <Tabs defaultValue="clinics" className="w-full">
        <TabsList>
          <TabsTrigger value="clinics">Clínicas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinics" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Clínica
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingClinic ? 'Editar Clínica' : 'Nova Clínica'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClinic 
                      ? 'Edite as informações da clínica abaixo.'
                      : 'Preencha as informações da nova clínica.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <ClinicForm
                  editingClinic={editingClinic}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Carregando clínicas...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          <ClinicUserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
