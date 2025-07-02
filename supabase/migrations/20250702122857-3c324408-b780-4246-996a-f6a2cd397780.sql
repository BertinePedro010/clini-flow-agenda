
-- Corrigir políticas RLS da tabela clinic_users para evitar recursão infinita
DROP POLICY IF EXISTS "Clinic admins can manage users in their clinics" ON public.clinic_users;

-- Recriar a política sem recursão
CREATE POLICY "Clinic admins can manage users in their clinics" ON public.clinic_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clinic_users cu
      WHERE cu.clinic_id = clinic_users.clinic_id 
      AND cu.user_id = auth.uid() 
      AND cu.role = 'admin'
    )
  );

-- Corrigir a função get_user_clinics para evitar problemas de recursão
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
STABLE SECURITY DEFINER
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

-- Simplificar a política de clinic_users para evitar recursão
DROP POLICY IF EXISTS "Clinic admins can manage users in their clinics" ON public.clinic_users;

CREATE POLICY "Clinic admins can manage users in their clinics" ON public.clinic_users
  FOR ALL USING (
    -- Permitir se o usuário é o próprio usuário sendo gerenciado
    user_id = auth.uid() OR
    -- Ou se é superadmin
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
  );
