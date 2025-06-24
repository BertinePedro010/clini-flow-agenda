
-- Adicionar campo domain_slug na tabela clinics para identificar subdomínio
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS domain_slug TEXT UNIQUE;

-- Criar tabela para associar usuários às suas clínicas padrão
CREATE TABLE IF NOT EXISTS public.user_clinic_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Enable RLS
ALTER TABLE public.user_clinic_associations ENABLE ROW LEVEL SECURITY;

-- RLS policies para user_clinic_associations
CREATE POLICY "Users can view their clinic associations" 
  ON public.user_clinic_associations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their clinic associations" 
  ON public.user_clinic_associations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their clinic associations" 
  ON public.user_clinic_associations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar clínica padrão quando usuário se registra
CREATE OR REPLACE FUNCTION public.create_default_clinic_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clinic_name TEXT;
  clinic_slug TEXT;
  new_clinic_id UUID;
BEGIN
  -- Gerar nome da clínica baseado no nome do usuário
  clinic_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || ' - Clínica';
  
  -- Gerar slug único baseado no email
  clinic_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]+', '', 'g'));
  
  -- Garantir que o slug seja único
  WHILE EXISTS (SELECT 1 FROM public.clinics WHERE domain_slug = clinic_slug) LOOP
    clinic_slug := clinic_slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  -- Criar nova clínica
  INSERT INTO public.clinics (name, slug, domain_slug, owner_id, phone, plan_type)
  VALUES (clinic_name, clinic_slug, clinic_slug, NEW.id, '', 'normal')
  RETURNING id INTO new_clinic_id;
  
  -- Associar usuário à clínica como padrão
  INSERT INTO public.user_clinic_associations (user_id, clinic_id, is_default)
  VALUES (NEW.id, new_clinic_id, true);
  
  RETURN NEW;
END;
$$;

-- Atualizar trigger existente para incluir criação de clínica
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.users_profiles (id, name, plan_type, trial_expires_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'normal',
    (NOW() + INTERVAL '15 days')
  );
  
  -- Criar clínica padrão
  PERFORM public.create_default_clinic_for_user();
  
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para obter clínica por subdomínio
CREATE OR REPLACE FUNCTION public.get_clinic_by_subdomain(subdomain TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  domain_slug TEXT,
  owner_id UUID,
  phone TEXT,
  plan_type TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.domain_slug,
    c.owner_id,
    c.phone,
    c.plan_type
  FROM public.clinics c
  WHERE c.domain_slug = subdomain
  LIMIT 1;
$$;

-- Função para obter clínica padrão do usuário
CREATE OR REPLACE FUNCTION public.get_user_default_clinic(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  domain_slug TEXT,
  owner_id UUID,
  phone TEXT,
  plan_type TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.domain_slug,
    c.owner_id,
    c.phone,
    c.plan_type
  FROM public.clinics c
  INNER JOIN public.user_clinic_associations uca ON uca.clinic_id = c.id
  WHERE uca.user_id = get_user_default_clinic.user_id 
    AND uca.is_default = true
  LIMIT 1;
$$;
