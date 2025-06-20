
import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentCalendar from '../components/AppointmentCalendar';

const Appointments = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const handleSubmit = (formData: any) => {
    console.log('Agendamento salvo:', formData);
    // Aqui será implementada a integração com Supabase
    setShowForm(false);
    setEditingAppointment(null);
  };

  if (showForm) {
    return (
      <AppointmentForm
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingAppointment(null);
        }}
        initialData={editingAppointment}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Agendamentos</h1>
            <p className="text-slate-600">Gerenciar consultas e horários</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center medical-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </button>
      </div>

      <AppointmentCalendar />
    </div>
  );
};

export default Appointments;
