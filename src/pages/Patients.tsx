
import React, { useState } from 'react';
import { Users, Plus, Search, User } from 'lucide-react';
import PatientForm from '../components/PatientForm';

const Patients = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);

  // Mock data - será substituído por dados reais do Supabase
  const [patients, setPatients] = useState([
    {
      id: 1,
      nome: 'Maria Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      email: 'maria@email.com',
      dataNascimento: '1985-05-15',
    },
    {
      id: 2,
      nome: 'Carlos Oliveira',
      cpf: '987.654.321-00',
      telefone: '(11) 88888-8888',
      email: 'carlos@email.com',
      dataNascimento: '1978-12-03',
    },
    {
      id: 3,
      nome: 'Fernanda Lima',
      cpf: '456.789.123-00',
      telefone: '(11) 77777-7777',
      email: 'fernanda@email.com',
      dataNascimento: '1992-08-22',
    },
  ]);

  const handleSubmit = (formData: any) => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === editingPatient.id ? { ...editingPatient, ...formData } : p));
      setEditingPatient(null);
    } else {
      const newPatient = {
        id: patients.length + 1,
        ...formData,
      };
      setPatients([...patients, newPatient]);
    }
    setShowForm(false);
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="medical-card p-6">
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{patient.nome}</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>CPF: {patient.cpf}</p>
                    <p>Tel: {patient.telefone}</p>
                    <p>E-mail: {patient.email}</p>
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

        {filteredPatients.length === 0 && (
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
