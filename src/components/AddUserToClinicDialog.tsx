
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Shield } from 'lucide-react';

interface AddUserToClinicDialogProps {
  clinicId: string;
  clinicName: string;
  onUserAdded: () => void;
}

const AddUserToClinicDialog: React.FC<AddUserToClinicDialogProps> = ({ 
  clinicId, 
  clinicName, 
  onUserAdded 
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'user'
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o email do usuário.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      toast({
        title: "Erro",
        description: "Por favor, informe um email válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting to add user to clinic:', {
        email: formData.email.trim(),
        clinicId,
        role: formData.role
      });

      const { data, error } = await supabase
        .rpc('add_user_to_clinic', {
          user_email: formData.email.trim(),
          clinic_id_param: clinicId,
          user_role: formData.role
        });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('Error adding user to clinic:', error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível adicionar o usuário à clínica.",
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        const result = data[0];
        console.log('Result from function:', result);
        
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message || "Usuário adicionado à clínica com sucesso.",
          });
          setFormData({ email: '', role: 'user' });
          setIsOpen(false);
          onUserAdded();
        } else {
          toast({
            title: "Aviso",
            description: result.message || "Não foi possível adicionar o usuário.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Resposta inesperada do servidor.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar usuário. Verifique se o usuário já possui uma conta no sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormData({ email: '', role: 'user' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Adicionar Usuário
          </DialogTitle>
          <DialogDescription>
            Adicionar um usuário à clínica "{clinicName}". O usuário deve já ter uma conta no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email do Usuário
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                O usuário deve já ter uma conta registrada no sistema
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Papel do Usuário
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Usuário
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-orange-500" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Administradores podem gerenciar outros usuários da clínica
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adicionando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserToClinicDialog;
