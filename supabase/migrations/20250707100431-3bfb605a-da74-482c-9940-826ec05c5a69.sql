
-- Corrigir a função add_user_to_clinic para resolver a referência ambígua ao user_id
CREATE OR REPLACE FUNCTION public.add_user_to_clinic(user_email text, clinic_id_param uuid, user_role text DEFAULT 'user'::text)
RETURNS TABLE(success boolean, message text, user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  target_user_profile_id UUID;
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

  -- Buscar o usuário pelo email na tabela auth.users
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;

  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado com este email'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Verificar se existe um perfil para este usuário
  SELECT up.id INTO target_user_profile_id
  FROM public.users_profiles up
  WHERE up.id = target_user_id;

  IF target_user_profile_id IS NULL THEN
    -- Criar perfil básico para o usuário se não existir
    INSERT INTO public.users_profiles (id, name, plan_type, trial_expires_at)
    VALUES (
      target_user_id,
      (SELECT COALESCE(raw_user_meta_data->>'name', email) FROM auth.users WHERE id = target_user_id),
      'normal',
      (NOW() + INTERVAL '15 days')
    );
  END IF;

  -- Verificar se o usuário já está na clínica
  IF EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE clinic_users.user_id = target_user_id AND clinic_users.clinic_id = clinic_id_param
  ) THEN
    RETURN QUERY SELECT false, 'Usuário já pertence a esta clínica'::TEXT, target_user_id;
    RETURN;
  END IF;

  -- Adicionar usuário à clínica
  INSERT INTO public.clinic_users (clinic_id, user_id, role, is_active)
  VALUES (clinic_id_param, target_user_id, user_role, true);

  RETURN QUERY SELECT true, 'Usuário adicionado com sucesso à clínica'::TEXT, target_user_id;
END;
$$;

-- Garantir que a política RLS permite a criação de perfis quando necessário
DROP POLICY IF EXISTS "Allow profile creation for new users" ON public.users_profiles;
CREATE POLICY "Allow profile creation for new users" ON public.users_profiles
  FOR INSERT 
  WITH CHECK (
    -- Superadmin pode criar qualquer perfil
    EXISTS (
      SELECT 1 FROM public.users_profiles 
      WHERE id = auth.uid() AND system_role = 'superadmin'
    )
    OR 
    -- Ou o usuário está criando seu próprio perfil
    auth.uid() = id
  );
