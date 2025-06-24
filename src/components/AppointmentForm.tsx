
import React, { useState, useEffect } from 'react';
import { Calendar, Save, X, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';

interface AppointmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { currentClinic } = useClinic();
  const [formData, setFormData] = useState({
    pacienteId: initialData?.pacienteId || '',
    medicoId: initialData?.medicoId || '',
    data: initialData?.data || '',
    hora: initialData?.hora || '',
    observacoes: initialData?.observacoes || '',
    status: initialData?.status || 'confirmado',
    especialidade: initialData?.especialidade || '',
    preco: initialData?.preco || 0,
  });

  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'especialidade') {
      const selectedEspecialidade = especialidades.find(esp => esp.specialty_name === value);
      setFormData({
        ...formData,
        [name]: value,
        preco: selectedEspecialidade ? selectedEspecialidade.price : 0,
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
            <select
              name="pacienteId"
              value={formData.pacienteId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Selecione o paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Médico *
            </label>
            <select
              name="medicoId"
              value={formData.medicoId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Selecione o médico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  {medico.nome} - {medico.especialidade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-sleeve-700 mb-2">
              Especialidade/Exame *
            </label>
            <select
              name="especialidade"
              value={formData.especialidade}
              onChange={handleChange}
              required
              disabled={loadingEspecialidades}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">
                {loadingEspecialidades ? 'Carregando...' : 'Selecione a especialidade'}
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
                name="preco"
                value={formData.preco}
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
              name="data"
              value={formData.data}
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
              name="hora"
              value={formData.hora}
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
              name="observacoes"
              value={formData.observacoes}
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
            className="flex items-center px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center medical-button"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Agendamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
