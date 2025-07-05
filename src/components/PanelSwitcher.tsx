
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Crown } from 'lucide-react';

const PanelSwitcher = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  if (!profile) return null;

  const panels = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: Settings,
      available: true
    },
    {
      id: 'admin',
      name: 'Admin',
      path: '/admin',
      icon: Shield,
      available: profile.system_role === 'clinic_admin' || profile.system_role === 'superadmin'
    },
    {
      id: 'superadmin',
      name: 'Super Admin',
      path: '/superadmin',
      icon: Crown,
      available: profile.system_role === 'superadmin'
    }
  ];

  const availablePanels = panels.filter(panel => panel.available);

  if (availablePanels.length <= 1) {
    return null; // Não mostrar se só tem um painel disponível
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Painéis
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availablePanels.map((panel) => {
          const Icon = panel.icon;
          return (
            <DropdownMenuItem
              key={panel.id}
              onClick={() => navigate(panel.path)}
              className="cursor-pointer"
            >
              <Icon className="w-4 h-4 mr-2" />
              {panel.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PanelSwitcher;
