
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-slate-800">
              Sistema de Agendamentos
            </h1>
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
