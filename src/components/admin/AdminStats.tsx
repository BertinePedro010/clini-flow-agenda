
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';

interface AdminStatsProps {
  totalClinics: number;
  totalUsers: number;
  activeAppointments: number;
  monthlyGrowth: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  totalClinics,
  totalUsers,
  activeAppointments,
  monthlyGrowth
}) => {
  const stats = [
    {
      title: 'Total de Clínicas',
      value: totalClinics,
      description: 'Clínicas cadastradas',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total de Usuários',
      value: totalUsers,
      description: 'Usuários ativos',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Agendamentos Ativos',
      value: activeAppointments,
      description: 'Este mês',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Crescimento',
      value: `${monthlyGrowth}%`,
      description: 'Último mês',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;
