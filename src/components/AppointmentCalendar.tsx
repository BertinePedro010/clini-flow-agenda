
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, User, Clock, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  price: number;
  status: string;
  notes?: string;
}

interface AppointmentCalendarProps {
  onEdit: (appointment: Appointment) => void;
  refreshTrigger: number;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ onEdit, refreshTrigger }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const { currentClinic } = useClinic();
  const { toast } = useToast();

  useEffect(() => {
    if (currentClinic) {
      fetchAppointments();
    }
  }, [currentClinic, refreshTrigger]);

  const fetchAppointments = async () => {
    if (!currentClinic) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments_schedule')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar agendamentos",
          variant: "destructive",
        });
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments_schedule')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('Error deleting appointment:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir agendamento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Agendamento excluído com sucesso",
        });
        fetchAppointments();
        if (selectedDate) {
          fetchDayAppointments(selectedDate);
        }
      }
    } catch (error) {
      console.error('Error in handleDeleteAppointment:', error);
    }
  };

  const fetchDayAppointments = async (dateStr: string) => {
    if (!currentClinic) return;
    
    try {
      const { data, error } = await supabase
        .from('appointments_schedule')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .eq('appointment_date', dateStr)
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching day appointments:', error);
      } else {
        setDayAppointments(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDayAppointments:', error);
    }
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    fetchDayAppointments(dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'concluído':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Calendário</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              <h2 className="text-xl font-semibold text-slate-800">
                {formatDate(currentDate)}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center font-medium text-slate-600 bg-slate-50 rounded-lg">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-slate-200 rounded-lg ${
                    day ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'
                  }`}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day && (
                    <>
                      <div className="font-medium text-slate-800 mb-2">{day}</div>
                      <div className="space-y-1">
                        {getAppointmentsForDate(day).slice(0, 2).map(appointment => (
                          <div
                            key={appointment.id}
                            className={`p-2 rounded text-xs ${getStatusColor(appointment.status)}`}
                          >
                            <div className="font-medium">{appointment.appointment_time}</div>
                            <div className="truncate">{appointment.patient_name}</div>
                          </div>
                        ))}
                        {getAppointmentsForDate(day).length > 2 && (
                          <div className="text-xs text-slate-500 p-1">
                            +{getAppointmentsForDate(day).length - 2} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day appointments */}
        <div className="medical-card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedDate ? `Agendamentos de ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : 'Selecione um dia'}
          </h3>
          
          {selectedDate ? (
            <div className="space-y-3">
              {dayAppointments.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhum agendamento para este dia</p>
              ) : (
                dayAppointments.map(appointment => (
                  <div key={appointment.id} className={`p-4 rounded-lg ${getStatusColor(appointment.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{appointment.appointment_time}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(appointment)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{appointment.patient_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{appointment.doctor_name}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {appointment.specialty} - R$ {Number(appointment.price).toFixed(2)}
                      </div>
                      {appointment.notes && (
                        <div className="text-xs text-slate-600 mt-2">
                          <strong>Obs:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Clique em um dia do calendário para ver os agendamentos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
