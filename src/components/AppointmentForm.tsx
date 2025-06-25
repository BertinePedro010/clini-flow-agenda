
import React, { useState, useEffect } from 'react';
import { Calendar, Save, X, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';

interface AppointmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { currentClinic } = useClinic();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patient_name: initialData?.patient_name || '',
    doctor_name: initialData?.doctor_name || '',
    appointment_date: initialData?.appointment_date || '',
    appointment_time: initialData?.appointment_time || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'confirmado',
    specialty: initialData?.specialty || '',
    price: initialData?.price || 0,
  });

  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock data - será substituído por dados reais do Supabase
  const pacientes = [
    { id: 1, nome: 'Maria Silva' },
    { id: 2, nome: 'Carlos Oliveira' },
    { id: 3, nome: 'Fernanda Lima' },
  ];

  const medicos = [
    { id: 1, nome: 'Dr. João Santos', especialidade: 'Cardiologia' },
    { id: 2, nome: 'Dra. Ana Costa', especialidade: 'Dermatologia' },
    { id: 3, nome: 'Dr. Pedro Alves', especialidade: 'Ortopedia' },
  ];

  useEffect(() => {
    if (currentClinic) {
      fetchEspecialidades();
    }
  }, [currentClinic]);

  const fetchEspecialidades = async () => {
    if (!currentClinic) return;
    
    try {
      setLoadingEspecialidades(true);
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('specialty_name');

      if (error) {
        console.error('Error fetching specialties:', error);
      } else {
        setEspecialidades(data || []);
      }
    } catch (error) {
      console.error('Error in fetchEspecialidades:', error);
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentClinic) {
      toast({
        title: "Erro",
        description: "Nenhuma clínica selecionada",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const appointmentData = {
        clinic_id: currentClinic.id,
        patient_name: formData.patient_name,
        doctor_name: formData.doctor_name,
        specialty: formData.specialty,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        price: parseFloat(formData.price.toString()),
        status: formData.status,
        notes: formData.notes || null,
      };

      let result;
      if (initialData?.id) {
        // Update existing appointment
        result = await supabase
          .from('appointments_schedule')
          .update({
            ...appointmentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);
      } else {
        // Create new appointment
        result = await supabase
          .from('appointments_schedule')
          .insert([appointmentData]);
      }

      if (result.error) {
        console.error('Error saving appointment:', result.error);
        toast({
          title: "Erro",
          description: "Erro ao salvar agendamento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: initialData?.id ? "Agendamento atualizado com sucesso" : "Agendamento criado com sucesso",
        });
        onSubmit(appointmentData);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar agendamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'specialty') {
      const selectedEspecialidade = especialidades.find(esp => esp.specialty_name === value);
      setFormData({
        ...formData,
        [name]: value,
        price: selectedEspecialidade ? selectedEspecialidade.price : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  if (!currentClinic) {
    return (
      <div className="medical-card p-6 max-w-2xl mx-auto">
        <p className="text-slate-600 text-center">Carregando dados da clínica...</p>
      </div>
    );
  }

  return (
    <div className="medical-card p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          {initialData ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paciente *
            </label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Nome do paciente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Médico *
            </label>
            <input
              type="text"
              name="doctor_name"
              value={formData.doctor_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Nome do médico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Exame/Especialidade *
            </label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
              disabled={loadingEspecialidades}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">
                {loadingEspecialidades ? 'Carregando...' : 'Selecione o exame/especialidade'}
              </option>
              {especialidades.map((especialidade) => (
                <option key={especialidade.id} value={especialidade.specialty_name}>
                  {especialidade.specialty_name} - R$ {Number(especialidade.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preço
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Horário *
            </label>
            <input
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="concluído">Concluído</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Observações adicionais sobre o agendamento..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center medical-button disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Agendamento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
