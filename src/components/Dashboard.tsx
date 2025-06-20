
import React from 'react';
import { Calendar, Users, User, Clock } from 'lucide-react';

const Dashboard = () => {
  // Mock data - será substituído por dados reais do Supabase
  const stats = [
    {
      title: 'Agendamentos Hoje',
      value: '12',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pacientes Cadastrados',
      value: '248',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Médicos Ativos',
      value: '8',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Próximo Atendimento',
      value: '14:30',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentAppointments = [
    {
      id: 1,
      patient: 'Maria Silva',
      doctor: 'Dr. João Santos',
      time: '09:00',
      status: 'confirmado',
    },
    {
      id: 2,
      patient: 'Carlos Oliveira',
      doctor: 'Dra. Ana Costa',
      time: '10:30',
      status: 'confirmado',
    },
    {
      id: 3,
      patient: 'Fernanda Lima',
      doctor: 'Dr. Pedro Alves',
      time: '14:00',
      status: 'concluído',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'concluído':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Visão geral do sistema de agendamentos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="medical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agendamentos Recentes */}
      <div className="medical-card p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Agendamentos de Hoje</h2>
        <div className="space-y-4">
          {recentAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{appointment.patient}</p>
                  <p className="text-sm text-slate-600">{appointment.doctor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-slate-700">{appointment.time}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="medical-card p-6 text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 mb-2">Novo Agendamento</h3>
          <p className="text-sm text-slate-600 mb-4">Marcar nova consulta</p>
          <button className="medical-button w-full">Agendar</button>
        </div>

        <div className="medical-card p-6 text-center">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 mb-2">Cadastrar Paciente</h3>
          <p className="text-sm text-slate-600 mb-4">Adicionar novo paciente</p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full">
            Cadastrar
          </button>
        </div>

        <div className="medical-card p-6 text-center">
          <User className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 mb-2">Cadastrar Médico</h3>
          <p className="text-sm text-slate-600 mb-4">Adicionar novo médico</p>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full">
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
