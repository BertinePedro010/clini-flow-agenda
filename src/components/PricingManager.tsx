
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit3, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/contexts/ClinicContext';

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
        setSpecialties(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSpecialties:', error);
    } finally {
      setLoading(false);
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
        .rpc('update_specialty_price', {
          specialty_id: specialtyId,
          new_price: newPrice
        });

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

  const handleAddSpecialty = async () => {
    if (!currentClinic) return;
    
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

      const { error } = await supabase
        .rpc('add_specialty', {
          clinic_id: currentClinic.id,
          specialty_name: newSpecialty.name.trim(),
          price: price
        });

      if (error) {
        console.error('Error adding specialty:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar especialidade",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Especialidade adicionada com sucesso",
        });
        setNewSpecialty({ name: '', price: '' });
        setShowAddForm(false);
        fetchSpecialties();
      }
    } catch (error) {
      console.error('Error in handleAddSpecialty:', error);
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
        <h2 className="text-xl font-semibold text-slate-800">Tabela de Preços</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center medical-button text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome da especialidade"
              value={newSpecialty.name}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Preço"
              step="0.01"
              value={newSpecialty.price}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, price: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-600 text-center py-4">Carregando especialidades...</p>
        ) : specialties.length === 0 ? (
          <p className="text-slate-600 text-center py-4">Nenhuma especialidade cadastrada</p>
        ) : (
          specialties.map((specialty) => (
            <div key={specialty.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-slate-800">{specialty.specialty_name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {editingId === specialty.id ? (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                    />
                    <button
                      onClick={() => handleUpdatePrice(specialty.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-green-600">R$ {Number(specialty.price).toFixed(2)}</span>
                    <button
                      onClick={() => startEdit(specialty)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PricingManager;
