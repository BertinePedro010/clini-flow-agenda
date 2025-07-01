
import React, { useEffect, useState } from 'react';
import { Calendar, Users, User, Clock } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import PricingManager from './PricingManager';

const Dashboard = () => {
  const { currentClinic, loading } = useClinic();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    activeDoctors: 0,
    nextAppointment: null as string | null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (currentClinic?.id) {
      fetchStats();
    }
  }, [currentClinic?.id]);

  const fetchStats = async () => {
    if (!currentClinic?.id) return;

    try {
      setStatsLoading(true);
      
      // Buscar agendamentos de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments } = await supabase
        .from('appointments_schedule')
        .select('*')
        .eq('clinic_id', currentClinic.id)
        .eq('appointment_date', today);

      // Buscar total de pacientes
      const { data: patients } = await supabase
        .from('clinic_patients')
        .select('id')
        .eq('clinic_id', currentClinic.id);

      // Buscar médicos ativos
      const { data: doctors } = await supabase
        .from('clinic_doctors')
        .select('id')
        .eq('clinic_id', currentClinic.id);

      // Buscar próximo agendamento
      const { data: nextAppointments } = await supabase
        .from('appointments_schedule')
        .select('appointment_time')
        .eq('clinic_id', currentClinic.id)
        .eq('appointment_date', today)
        .gte('appointment_time', new Date().toTimeString().split(' ')[0])
        .order('appointment_time', { ascending: true })
        .limit(1);

      setStats({
        todayAppointments: todayAppointments?.length || 0,
        totalPatients: patients?.length || 0,
        activeDoctors: doctors?.length || 0,
        nextAppointment: nextAppointments?.[0]?.appointment_time || null,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Agendamentos Hoje',
      value: statsLoading ? '...' : stats.todayAppointments.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pacientes Cadastrados',
      value: statsLoading ? '...' : stats.totalPatients.toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Médicos Ativos',
      value: statsLoading ? '...' : stats.activeDoctors.toString(),
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Próximo Atendimento',
      value: statsLoading ? '...' : (stats.nextAppointment || '--:--'),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Carregando dados da clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          {currentClinic ? `${currentClinic.name} - Visão geral do sistema` : "Nenhuma clínica selecionada"}
        </p>
        {currentClinic?.domain_slug && (
          <p className="text-sm text-blue-600 mt-1">
            Subdomínio: {currentClinic.domain_slug}
          </p>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Tabela de Preços */}
        <PricingManager />
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
