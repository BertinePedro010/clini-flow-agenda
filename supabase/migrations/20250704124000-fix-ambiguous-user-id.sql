
-- Corrigir a função get_clinic_users para evitar referência ambígua de user_id
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
      SELECT 1 FROM public.users_profiles up2
      WHERE up2.id = auth.uid() AND up2.system_role = 'superadmin'
    )
    OR
    -- Admin da clínica pode ver usuários da sua clínica
    public.is_clinic_admin_safe(clinic_id_param)
  )
  ORDER BY cu.created_at DESC;
$$;
