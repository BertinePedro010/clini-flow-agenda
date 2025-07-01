
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Users, Edit, ArrowLeft } from 'lucide-react';

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
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: '',
    phone: '',
    plan_type: 'normal'
  });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/auth');
      return;
    }

    if (profile?.role === 'admin') {
      fetchClinics();
    }
  }, [user, profile, loading, navigate]);

  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
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
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClinic.name) {
      toast({
        title: "Erro",
        description: "Nome da clínica é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Gerar slug único
      const slug = newClinic.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('clinics')
        .insert({
          name: newClinic.name,
          slug: slug,
          domain_slug: slug,
          owner_id: user?.id || '',
          phone: newClinic.phone,
          plan_type: newClinic.plan_type
        })
        .select()
        .single();

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
          description: "Clínica criada com sucesso!",
        });
        setIsCreateDialogOpen(false);
        setNewClinic({ name: '', phone: '', plan_type: 'normal' });
        fetchClinics();
      }
    } catch (error) {
      console.error('Error in handleCreateClinic:', error);
    }
  };

  if (loading || loadingClinics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
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
                Painel Administrativo
              </h1>
              <p className="text-slate-600">
                Gerencie todas as clínicas do sistema
              </p>
            </div>
            <div className="flex space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Clínica
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Clínica</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da nova clínica
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClinic} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome da Clínica *</Label>
                      <Input
                        id="name"
                        value={newClinic.name}
                        onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                        placeholder="Digite o nome da clínica"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newClinic.phone}
                        onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan_type">Tipo de Plano</Label>
                      <select
                        id="plan_type"
                        value={newClinic.plan_type}
                        onChange={(e) => setNewClinic({ ...newClinic, plan_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="normal">Normal</option>
                        <option value="plus">Plus</option>
                        <option value="ultra">Ultra</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Clínica</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {clinic.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Slug: {clinic.slug}
                      </p>
                      <p className="text-xs text-slate-500">
                        Criada em: {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        Plano: <span className="capitalize">{clinic.plan_type}</span>
                      </p>
                      {clinic.phone && (
                        <p className="text-xs text-slate-500">
                          Tel: {clinic.phone}
                        </p>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {clinics.length === 0 && (
            <Card className="medical-card">
              <CardContent className="p-8 text-center">
                <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhuma clínica encontrada
                </h3>
                <p className="text-slate-500">
                  Clique em "Nova Clínica" para criar a primeira clínica.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
