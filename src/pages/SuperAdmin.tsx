
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Edit, Trash2, Users, Phone, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClinicUserManager from '@/components/ClinicUserManager';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plan_type: 'normal',
    domain_slug: ''
  });

  useEffect(() => {
    fetchClinics();
  }, []);

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
            owner_id: 'temp-owner' // Será atualizado quando um owner for atribuído
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
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
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
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Clínica</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_slug">Domínio</Label>
                  <Input
                    id="domain_slug"
                    value={formData.domain_slug}
                    onChange={(e) => setFormData({ ...formData, domain_slug: e.target.value })}
                    placeholder="exemplo (será: exemplo.clinica.com)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan_type">Tipo de Plano</Label>
                  <select
                    id="plan_type"
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="normal">Normal</option>
                    <option value="plus">Plus</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClinic ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="clinics" className="w-full">
        <TabsList>
          <TabsTrigger value="clinics">Clínicas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinics" className="space-y-4">
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
                <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {clinic.plan_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    <CardDescription>
                      Criada em {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {clinic.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {clinic.phone}
                      </div>
                    )}
                    {clinic.domain_slug && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Globe className="w-4 h-4 mr-2" />
                        {clinic.domain_slug}.clinica.com
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(clinic)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(clinic.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
