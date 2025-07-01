
-- Criar enum para tipos de usuário no sistema
CREATE TYPE public.user_system_role AS ENUM ('superadmin', 'clinic_admin', 'clinic_user');

-- Atualizar tabela users_profiles para incluir role do sistema
ALTER TABLE public.users_profiles 
ADD COLUMN system_role user_system_role DEFAULT 'clinic_user';

-- Criar tabela para gerenciar usuários de clínicas
CREATE TABLE public.clinic_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

-- Habilitar RLS na tabela clinic_users
ALTER TABLE public.clinic_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clinic_users
CREATE POLICY "Superadmins can manage all clinic users" ON public.clinic_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
  );

CREATE POLICY "Clinic admins can manage users in their clinics" ON public.clinic_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinic_users cu
      JOIN public.users_profiles up ON up.id = auth.uid()
      WHERE cu.clinic_id = clinic_users.clinic_id 
      AND cu.user_id = auth.uid() 
      AND cu.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own clinic associations" ON public.clinic_users
  FOR SELECT USING (user_id = auth.uid());

-- Atualizar políticas RLS existentes para considerar o novo sistema
-- Atualizar política de clínicas para permitir que superadmins vejam tudo
DROP POLICY IF EXISTS "Users can view clinics" ON public.clinics;
CREATE POLICY "Superadmins can manage all clinics" ON public.clinics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their associated clinics" ON public.clinics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clinic_users cu
      WHERE cu.clinic_id = clinics.id AND cu.user_id = auth.uid()
    )
  );

-- Função para verificar se usuário é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_profiles 
    WHERE id = auth.uid() AND system_role = 'superadmin'
  );
$$;

-- Função para verificar se usuário é admin de uma clínica específica
CREATE OR REPLACE FUNCTION public.is_clinic_admin(clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE clinic_id = is_clinic_admin.clinic_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Função para obter clínicas do usuário
CREATE OR REPLACE FUNCTION public.get_user_clinics(user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  domain_slug TEXT,
  owner_id UUID,
  phone TEXT,
  plan_type TEXT,
  user_role TEXT,
  is_active BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.domain_slug,
    c.owner_id,
    c.phone,
    c.plan_type,
    cu.role as user_role,
    cu.is_active
  FROM public.clinics c
  JOIN public.clinic_users cu ON cu.clinic_id = c.id
  WHERE cu.user_id = get_user_clinics.user_id
  AND cu.is_active = true
  ORDER BY c.name;
$$;

-- Definir o primeiro usuário como superadmin (você)
UPDATE public.users_profiles 
SET system_role = 'superadmin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'pedrobertine32@gmail.com'
  LIMIT 1
);
