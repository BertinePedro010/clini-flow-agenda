
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';
import PatientForm from '../components/PatientForm';

const Patients = () => {
  const { currentClinic } = useClinic();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClinic) {
      fetchPatients();
    }
  }, [currentClinic]);

  const fetchPatients = async () => {
    if (!currentClinic) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_patients')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('name');

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar pacientes",
          variant: "destructive",
        });
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPatients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!currentClinic) return;

    try {
      const patientData = {
        clinic_id: currentClinic.id,
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        birth_date: formData.dataNascimento,
      };

      let result;
      if (editingPatient) {
        result = await supabase
          .from('clinic_patients')
          .update(patientData)
          .eq('id', editingPatient.id);
      } else {
        result = await supabase
          .from('clinic_patients')
          .insert([patientData]);
      }

      if (result.error) {
        console.error('Error saving patient:', result.error);
        toast({
          title: "Erro",
          description: "Erro ao salvar paciente",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: editingPatient ? "Paciente atualizado com sucesso" : "Paciente cadastrado com sucesso",
        });
        setShowForm(false);
        setEditingPatient(null);
        fetchPatients();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar paciente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient({
      ...patient,
      nome: patient.name,
      telefone: patient.phone,
      dataNascimento: patient.birth_date,
    });
    setShowForm(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  if (showForm) {
    return (
      <PatientForm
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingPatient(null);
        }}
        initialData={editingPatient}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Pacientes</h1>
            <p className="text-slate-600">Gerenciar cadastro de pacientes</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div className="medical-card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="medical-card p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando pacientes...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      {patient.phone && <p>Tel: {patient.phone}</p>}
                      {patient.email && <p>E-mail: {patient.email}</p>}
                      {patient.birth_date && <p>Nascimento: {new Date(patient.birth_date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPatients.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum paciente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
