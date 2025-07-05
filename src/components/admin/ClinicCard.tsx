
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, Trash2, Phone, Globe } from 'lucide-react';

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

interface ClinicCardProps {
  clinic: Clinic;
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinicId: string) => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <Badge variant="outline" className="capitalize">
            {clinic.plan_type}
          </Badge>
        </div>
        <CardTitle className="text-lg">{clinic.name}</CardTitle>
        <CardDescription>
          Criada em {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {clinic.phone && (
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="w-4 h-4 mr-2" />
            {clinic.phone}
          </div>
        )}
        {clinic.domain_slug && (
          <div className="flex items-center text-sm text-slate-600">
            <Globe className="w-4 h-4 mr-2" />
            {clinic.domain_slug}.clinica.com
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(clinic)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(clinic.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicCard;
