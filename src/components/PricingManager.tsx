
import React, { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Specialty {
  id: string;
  specialty_name: string;
  price: number;
  clinic_id: string;
}

const PricingManager = () => {
  const [especialidades, setEspecialidades] = useState<Specialty[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [newSpecialty, setNewSpecialty] = useState({ name: '', price: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('specialties_pricing')
        .select('*')
        .order('specialty_name');

      if (error) {
        console.error('Error fetching specialties:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as especialidades.",
          variant: "destructive",
        });
      } else {
        setEspecialidades(data || []);
      }
    } catch (error) {
      console.error('Error in fetchEspecialidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditingPrice(currentPrice);
  };

  const handleSavePrice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('specialties_pricing')
        .update({ 
          price: editingPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating price:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o preço.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Preço atualizado com sucesso!",
        });
        setEditingId(null);
        fetchEspecialidades();
      }
    } catch (error) {
      console.error('Error in handleSavePrice:', error);
    }
  };

  const handleAddSpecialty = async () => {
    if (!newSpecialty.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da especialidade é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the first clinic ID (assuming single clinic for now)
      const { data: clinics } = await supabase
        .from('clinics')
        .select('id')
        .limit(1);

      if (!clinics || clinics.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma clínica encontrada.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('specialties_pricing')
        .insert({
          clinic_id: clinics[0].id,
          specialty_name: newSpecialty.name,
          price: newSpecialty.price
        });

      if (error) {
        console.error('Error adding specialty:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a especialidade.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Especialidade adicionada com sucesso!",
        });
        setNewSpecialty({ name: '', price: 0 });
        setShowAddForm(false);
        fetchEspecialidades();
      }
    } catch (error) {
      console.error('Error in handleAddSpecialty:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPrice(0);
  };

  if (loading) {
    return (
      <div className="medical-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Tabela de Preços
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Especialidade
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Adicionar Nova Especialidade</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Nome da especialidade"
              value={newSpecialty.name}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <input
              type="number"
              placeholder="Preço"
              step="0.01"
              min="0"
              value={newSpecialty.price}
              onChange={(e) => setNewSpecialty({ ...newSpecialty, price: parseFloat(e.target.value) || 0 })}
              className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleAddSpecialty}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSpecialty({ name: '', price: 0 });
              }}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {especialidades.map((especialidade) => (
          <div key={especialidade.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <div>
              <h3 className="font-medium text-slate-800">{especialidade.specialty_name}</h3>
            </div>
            <div className="flex items-center space-x-3">
              {editingId === especialidade.id ? (
                <>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSavePrice(especialidade.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-green-600">
                    R$ {Number(especialidade.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleEditPrice(especialidade.id, Number(especialidade.price))}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {especialidades.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma especialidade cadastrada.</p>
            <p className="text-sm">Clique em "Nova Especialidade" para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingManager;
