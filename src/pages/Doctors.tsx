
import React, { useState } from 'react';
import { User, Plus, Search } from 'lucide-react';
import DoctorForm from '../components/DoctorForm';

const Doctors = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Mock data - será substituído por dados reais do Supabase
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      nome: 'Dr. João Santos',
      crm: 'CRM/SP 123456',
      especialidade: 'Cardiologia',
      telefone: '(11) 99999-9999',
      email: 'joao@clinica.com',
    },
    {
      id: 2,
      nome: 'Dra. Ana Costa',
      crm: 'CRM/SP 654321',
      especialidade: 'Dermatologia',
      telefone: '(11) 88888-8888',
      email: 'ana@clinica.com',
    },
    {
      id: 3,
      nome: 'Dr. Pedro Alves',
      crm: 'CRM/SP 789123',
      especialidade: 'Ortopedia',
      telefone: '(11) 77777-7777',
      email: 'pedro@clinica.com',
    },
  ]);

  const handleSubmit = (formData: any) => {
    if (editingDoctor) {
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...editingDoctor, ...formData } : d));
      setEditingDoctor(null);
    } else {
      const newDoctor = {
        id: doctors.length + 1,
        ...formData,
      };
      setDoctors([...doctors, newDoctor]);
    }
    setShowForm(false);
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{doctor.nome}</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{doctor.crm} - {doctor.especialidade}</p>
                    <p>Tel: {doctor.telefone}</p>
                    <p>E-mail: {doctor.email}</p>
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

        {filteredDoctors.length === 0 && (
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
