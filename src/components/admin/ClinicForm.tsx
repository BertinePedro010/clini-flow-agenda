
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  domain_slug: string;
  owner_id: string;
  phone: string;
  plan_type: string;
  created_at: string;
}

interface ClinicFormProps {
  editingClinic: Clinic | null;
  formData: {
    name: string;
    phone: string;
    plan_type: string;
    domain_slug: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ClinicForm: React.FC<ClinicFormProps> = ({
  editingClinic,
  formData,
  setFormData,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Clínica</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="domain_slug">Domínio</Label>
          <Input
            id="domain_slug"
            value={formData.domain_slug}
            onChange={(e) => setFormData({ ...formData, domain_slug: e.target.value })}
            placeholder="exemplo (será: exemplo.clinica.com)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan_type">Tipo de Plano</Label>
          <select
            id="plan_type"
            value={formData.plan_type}
            onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="normal">Normal</option>
            <option value="plus">Plus</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingClinic ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ClinicForm;
