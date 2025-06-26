
import React, { useState, useEffect } from 'react';
import { User, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import DoctorForm from '../components/DoctorForm';

const Doctors = () => {
  const { currentClinic } = useClinic();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClinic) {
      fetchDoctors();
    }
  }, [currentClinic]);

  const fetchDoctors = async () => {
    if (!currentClinic) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_doctors')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar médicos",
          variant: "destructive",
        });
      } else {
        setDoctors(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDoctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!currentClinic) return;

    try {
      const doctorData = {
        clinic_id: currentClinic.id,
        name: formData.nome,
        crm: formData.crm || null,
        specialty: formData.especialidade || null,
        email: formData.email || null,
        phone: formData.telefone || null,
      };

      let result;
      if (editingDoctor) {
        result = await supabase
          .from('clinic_doctors')
          .update(doctorData)
          .eq('id', editingDoctor.id);
      } else {
        result = await supabase
          .from('clinic_doctors')
          .insert([doctorData]);
      }

      if (result.error) {
        console.error('Error saving doctor:', result.error);
        toast({
          title: "Erro",
          description: "Erro ao salvar médico",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: editingDoctor ? "Médico atualizado com sucesso" : "Médico cadastrado com sucesso",
        });
        setShowForm(false);
        setEditingDoctor(null);
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar médico",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor({
      ...doctor,
      nome: doctor.name,
      telefone: doctor.phone,
      especialidade: doctor.specialty,
    });
    setShowForm(true);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.crm && doctor.crm.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showForm) {
    return (
      <DoctorForm
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDoctor(null);
        }}
        initialData={editingDoctor}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Médicos</h1>
            <p className="text-slate-600">Gerenciar cadastro de médicos</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Médico
        </button>
      </div>

      {/* Search Bar */}
      <div className="medical-card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CRM ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Doctors List */}
      <div className="medical-card p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando médicos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      {doctor.crm && doctor.specialty && <p>{doctor.crm} - {doctor.specialty}</p>}
                      {doctor.phone && <p>Tel: {doctor.phone}</p>}
                      {doctor.email && <p>E-mail: {doctor.email}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum médico encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
