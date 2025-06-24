
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const Layout = () => {
  const { currentClinic, loading } = useClinic();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {loading ? 'Carregando...' : currentClinic?.name || 'Sistema de Agendamentos'}
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
