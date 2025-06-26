import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit3, Save, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Specialty {
  id: string;
  specialty_name: string;
  price: number;
  clinic_id: string;
}

const PricingManager = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [newSpecialty, setNewSpecialty] = useState({ name: '', price: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { currentClinic } = useClinic();

  useEffect(() => {
    if (currentClinic) {
      fetchSpecialties();
    }
  }, [currentClinic]);

  const fetchSpecialties = async () => {
    if (!currentClinic) return;
    
    try {
      setLoading(true);
      console.log('Fetching specialties for clinic:', currentClinic.id);
      
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('specialty_name');

      if (error) {
        console.error('Error fetching specialties:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar especialidades",
          variant: "destructive",
        });
      } else {
        console.log('Specialties fetched:', data);
        setSpecialties(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSpecialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = async () => {
    if (!currentClinic) {
      console.error('No current clinic available');
      toast({
        title: "Erro",
        description: "Nenhuma clínica selecionada",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const price = parseFloat(newSpecialty.price);
      if (!newSpecialty.name.trim() || isNaN(price) || price < 0) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos corretamente",
          variant: "destructive",
        });
        return;
      }

      console.log('Adding specialty:', {
        clinic_id: currentClinic.id,
        specialty_name: newSpecialty.name.trim(),
        price: price
      });

      const { data, error } = await supabase
        .from('specialties')
        .insert({
          clinic_id: currentClinic.id,
          specialty_name: newSpecialty.name.trim(),
          price: price
        })
        .select();

      if (error) {
        console.error('Error adding specialty:', error);
        toast({
          title: "Erro",
          description: `Erro ao adicionar especialidade/exame: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Specialty added successfully:', data);
        toast({
          title: "Sucesso",
          description: "Especialidade/exame adicionado com sucesso",
        });
        setNewSpecialty({ name: '', price: '' });
        setShowAddForm(false);
        fetchSpecialties();
      }
    } catch (error) {
      console.error('Error in handleAddSpecialty:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar especialidade/exame",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrice = async (specialtyId: string) => {
    try {
      const newPrice = parseFloat(editPrice);
      if (isNaN(newPrice) || newPrice < 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira um preço válido",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('specialties')
        .update({ 
          price: newPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', specialtyId);

      if (error) {
        console.error('Error updating specialty price:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar preço",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Preço atualizado com sucesso",
        });
        setEditingId(null);
        setEditPrice('');
        fetchSpecialties();
      }
    } catch (error) {
      console.error('Error in handleUpdatePrice:', error);
    }
  };

  const handleDeleteSpecialty = async (specialtyId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta especialidade/exame?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('specialties')
        .delete()
        .eq('id', specialtyId);

      if (error) {
        console.error('Error deleting specialty:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir especialidade/exame",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Especialidade/exame excluído com sucesso",
        });
        fetchSpecialties();
      }
    } catch (error) {
      console.error('Error in handleDeleteSpecialty:', error);
    }
  };

  const startEdit = (specialty: Specialty) => {
    setEditingId(specialty.id);
    setEditPrice(specialty.price.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  if (!currentClinic) {
    return (
      <div className="medical-card p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Tabela de Preços</h2>
        <p className="text-slate-600">Carregando dados da clínica...</p>
      </div>
    );
  }

  return (
    <div className="medical-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Tabela de Preços - Exames e Especialidades</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Exame/Especialidade
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium text-slate-800 mb-3">Novo Exame/Especialidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Nome do exame/especialidade"
              value={newSpecialty.name}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Preço (R$)"
              step="0.01"
              value={newSpecialty.price}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, price: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddSpecialty}
              className="flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSpecialty({ name: '', price: '' });
              }}
              className="flex items-center px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-600">Carregando exames e especialidades...</p>
        </div>
      ) : specialties.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Nenhum exame/especialidade cadastrado</p>
          <p className="text-sm text-slate-500">Clique em "Adicionar Exame/Especialidade" para começar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exame/Especialidade</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{specialty.specialty_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === specialty.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-center"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-green-600">
                        R$ {Number(specialty.price).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {editingId === specialty.id ? (
                        <>
                          <button
                            onClick={() => handleUpdatePrice(specialty.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Salvar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(specialty)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar preço"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpecialty(specialty.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PricingManager;
