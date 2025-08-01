
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import ClinicSelector from './ClinicSelector';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import PanelSwitcher from './PanelSwitcher';

const Layout = () => {
  const { user, profile, loading: authLoading, needsClinicSelection } = useAuth();
  const { currentClinic, loading: clinicLoading, setCurrentClinic } = useClinic();

  // Se ainda está carregando auth, mostrar loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se é superadmin, usar layout simples sem sidebar
  if (profile?.system_role === 'superadmin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Sistema de Administração
              </h1>
              <p className="text-sm text-slate-500">
                Painel Super Admin
              </p>
            </div>
            <div className="flex items-center gap-4">
              <PanelSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  // Se precisa selecionar clínica (após login)
  if (needsClinicSelection) {
    return (
      <ClinicSelector 
        onClinicSelected={(clinic) => {
          setCurrentClinic(clinic);
        }} 
      />
    );
  }

  // Se está carregando clínicas, mostrar loading
  if (clinicLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando clínica...</p>
        </div>
      </div>
    );
  }

  // Se não tem clínica selecionada, mostrar seletor
  if (!currentClinic) {
    return (
      <ClinicSelector 
        onClinicSelected={(clinic) => {
          setCurrentClinic(clinic);
        }} 
      />
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
            <div className="flex items-center gap-4">
              <PanelSwitcher />
              <UserMenu />
            </div>
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
