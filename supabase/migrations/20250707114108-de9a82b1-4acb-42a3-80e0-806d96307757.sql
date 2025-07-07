
-- Primeiro, vamos remover os triggers antigos que podem estar causando problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_default_clinic_for_user();

-- Criar uma função simples e segura para criar perfil de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar apenas o perfil do usuário, sem clínica por enquanto
  INSERT INTO public.users_profiles (id, name, plan_type, trial_expires_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'normal',
    (NOW() + INTERVAL '15 days')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se der erro, registrar no log mas não falhar o cadastro
    RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar o trigger de forma mais simples
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
