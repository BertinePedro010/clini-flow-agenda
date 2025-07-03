
-- Corrigir as políticas RLS que estão causando recursão infinita
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Clinic admins can manage users in their clinics" ON public.clinic_users;

-- Recriar política sem recursão
CREATE POLICY "Clinic admins can manage users in their clinics" ON public.clinic_users
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
  );

-- Criar função para verificar se é admin de clínica sem causar recursão
CREATE OR REPLACE FUNCTION public.is_clinic_admin_safe(clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE clinic_id = is_clinic_admin_safe.clinic_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  );
$$;

-- Atualizar função get_clinic_users para usar a função segura
CREATE OR REPLACE FUNCTION public.get_clinic_users(clinic_id_param UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    up.id,
    up.name,
    au.email,
    cu.role,
    cu.is_active,
    cu.created_at
  FROM public.clinic_users cu
  JOIN public.users_profiles up ON up.id = cu.user_id
  JOIN auth.users au ON au.id = cu.user_id
  WHERE cu.clinic_id = clinic_id_param
  AND (
    -- Superadmin pode ver todos
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
    OR
    -- Admin da clínica pode ver usuários da sua clínica
    public.is_clinic_admin_safe(clinic_id_param)
  )
  ORDER BY cu.created_at DESC;
$$;
