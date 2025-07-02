
-- Corrigir as políticas RLS para garantir isolamento completo entre clínicas
-- Atualizar políticas da tabela clinic_users para permitir superadmins verem tudo
DROP POLICY IF EXISTS "Superadmins can manage all clinic users" ON public.clinic_users;
DROP POLICY IF EXISTS "Clinic admins can manage users in their clinics" ON public.clinic_users;
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON public.clinic_users;

CREATE POLICY "Superadmins can manage all clinic users" ON public.clinic_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their own clinic associations" ON public.clinic_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clinic admins can manage users in their clinics" ON public.clinic_users
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.clinic_users cu2
      WHERE cu2.clinic_id = clinic_users.clinic_id 
      AND cu2.user_id = auth.uid() 
      AND cu2.role = 'admin'
      AND cu2.is_active = true
    )
  );

-- Função para obter usuários de uma clínica específica (para superadmins)
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
    EXISTS (
      SELECT 1 FROM public.clinic_users cu2
      WHERE cu2.clinic_id = clinic_id_param
      AND cu2.user_id = auth.uid() 
      AND cu2.role = 'admin'
      AND cu2.is_active = true
    )
  )
  ORDER BY cu.created_at DESC;
$$;

-- Função para adicionar usuário a uma clínica
CREATE OR REPLACE FUNCTION public.add_user_to_clinic(
  user_email TEXT,
  clinic_id_param UUID,
  user_role TEXT DEFAULT 'user'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Verificar se o usuário atual pode adicionar usuários a esta clínica
  IF NOT EXISTS (
    SELECT 1 FROM public.users_profiles 
    WHERE id = auth.uid() AND system_role = 'superadmin'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.clinic_users cu
    WHERE cu.clinic_id = clinic_id_param
    AND cu.user_id = auth.uid() 
    AND cu.role = 'admin'
    AND cu.is_active = true
  ) THEN
    RETURN QUERY SELECT false, 'Sem permissão para adicionar usuários a esta clínica'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Buscar o usuário pelo email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;

  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar se o usuário já está na clínica
  IF EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE user_id = target_user_id AND clinic_id = clinic_id_param
  ) THEN
    RETURN QUERY SELECT false, 'Usuário já pertence a esta clínica'::TEXT, target_user_id;
    RETURN;
  END IF;

  -- Adicionar usuário à clínica
  INSERT INTO public.clinic_users (clinic_id, user_id, role, is_active)
  VALUES (clinic_id_param, target_user_id, user_role, true);

  RETURN QUERY SELECT true, 'Usuário adicionado com sucesso'::TEXT, target_user_id;
END;
$$;
