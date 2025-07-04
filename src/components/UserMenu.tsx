
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Shield, Crown, UserCircle } from 'lucide-react';

const UserMenu = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfile = () => {
    navigate('/perfil');
  };

  const handleSettings = () => {
    navigate('/configuracoes');
  };

  if (!user || !profile) {
    return (
      <Button onClick={() => navigate('/auth')} variant="outline">
        Login
      </Button>
    );
  }

  const isSuperAdmin = profile.system_role === 'superadmin';
  const isAdmin = profile.system_role === 'superadmin' || profile.system_role === 'clinic_admin';

  return (
    <div className="flex items-center gap-2">
      {/* Botão de logout direto e visível */}
      <Button 
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>

      {/* Menu dropdown para outras opções */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            {profile.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile}>
            <UserCircle className="w-4 h-4 mr-2" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            <span>Configurações</span>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                <span>Administração</span>
              </DropdownMenuItem>
            </>
          )}
          {isSuperAdmin && (
            <DropdownMenuItem onClick={() => navigate('/superadmin')}>
              <Crown className="w-4 h-4 mr-2" />
              <span>Super Admin</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
