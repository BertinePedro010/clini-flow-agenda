
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import ClinicSelector from './ClinicSelector';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const Layout = () => {
  const { user, profile } = useAuth();
  const { currentClinic, loading, setCurrentClinic } = useClinic();
  const [showClinicSelector, setShowClinicSelector] = useState(false);

  // Se é superadmin, não precisa de clínica
  if (profile?.system_role === 'superadmin') {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-slate-500">
                  Administração geral do sistema
                </p>
              </div>
              <UserMenu />
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Se não tem clínica selecionada e não está carregando, mostrar seletor
  if (!currentClinic && !loading) {
    return (
      <ClinicSelector 
        onClinicSelected={(clinic) => {
          setCurrentClinic(clinic);
          setShowClinicSelector(false);
        }} 
      />
    );
  }

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {currentClinic?.name || 'Sistema de Agendamentos'}
              </h1>
              {currentClinic?.domain_slug && (
                <p className="text-sm text-slate-500">
                  {currentClinic.domain_slug}.clinica.com
                </p>
              )}
            </div>
            <UserMenu />
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
