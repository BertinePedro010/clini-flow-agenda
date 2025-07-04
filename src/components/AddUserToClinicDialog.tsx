
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

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

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('add_user_to_clinic', {
          user_email: formData.email.trim(),
          clinic_id_param: clinicId,
          user_role: formData.role
        });

      if (error) {
        console.error('Error adding user to clinic:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o usuário à clínica.",
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          toast({
            title: "Sucesso",
            description: "Usuário adicionado à clínica com sucesso.",
          });
          setFormData({ email: '', role: 'user' });
          setIsOpen(false);
          onUserAdded();
        } else {
          toast({
            title: "Erro",
            description: result.message || "Não foi possível adicionar o usuário.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Adicionar um usuário à clínica "{clinicName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Papel do Usuário</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? 'Adicionando...' : 'Adicionar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserToClinicDialog;
