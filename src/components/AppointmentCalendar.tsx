
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, User, Clock } from 'lucide-react';

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Mock data - será substituído por dados reais do Supabase
  const appointments = [
    {
      id: 1,
      date: '2024-06-20',
      time: '09:00',
      patient: 'Maria Silva',
      doctor: 'Dr. João Santos',
      status: 'confirmado',
    },
    {
      id: 2,
      date: '2024-06-20',
      time: '10:30',
      patient: 'Carlos Oliveira',
      doctor: 'Dra. Ana Costa',
      status: 'confirmado',
    },
    {
      id: 3,
      date: '2024-06-21',
      time: '14:00',
      patient: 'Fernanda Lima',
      doctor: 'Dr. Pedro Alves',
      status: 'concluído',
    },
  ];

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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
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
  };

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateStr);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

      {/* Calendar Header */}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week days header */}
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-medium text-slate-600 bg-slate-50 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-slate-200 rounded-lg ${
                day ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'
              }`}
            >
              {day && (
                <>
                  <div className="font-medium text-slate-800 mb-2">{day}</div>
                  <div className="space-y-1">
                    {getAppointmentsForDate(day).map(appointment => (
                      <div
                        key={appointment.id}
                        className={`p-2 rounded text-xs ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-medium">{appointment.time}</div>
                        <div className="truncate">{appointment.patient}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="medical-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Agendamentos de Hoje</h3>
        <div className="space-y-3">
          {appointments
            .filter(apt => apt.date === '2024-06-20')
            .map(appointment => (
              <div key={appointment.id} className={`p-4 rounded-lg ${getStatusColor(appointment.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{appointment.time}</span>
                  </div>
                  <span className="text-xs font-medium uppercase">
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{appointment.patient}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{appointment.doctor}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
