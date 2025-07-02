
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, User, Home, UserCircle, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/agendamentos', icon: Calendar, label: 'Agendamentos' },
    { path: '/pacientes', icon: Users, label: 'Pacientes' },
    { path: '/medicos', icon: User, label: 'Médicos' },
  ];

  const accountItems = [
    { path: '/perfil', icon: UserCircle, label: 'Perfil' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-slate-200 z-50">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 medical-gradient rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">CliniAgenda</h1>
            <p className="text-sm text-slate-500">Sistema Médico</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-6">
        {/* Menu Principal */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Principal
          </h3>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Menu da Conta */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Conta
          </h3>
          <div className="space-y-2">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="medical-card p-4 text-center">
          <p className="text-sm text-slate-600 mb-2">Sistema integrado com</p>
          <div className="text-xs text-slate-500 font-mono">Supabase Backend</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
