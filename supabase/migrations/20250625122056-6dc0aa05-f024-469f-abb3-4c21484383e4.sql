
-- Primeiro, vamos verificar e corrigir as políticas RLS para as tabelas necessárias

-- Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela clinics
DROP POLICY IF EXISTS "Users can view clinics" ON public.clinics;
CREATE POLICY "Users can view clinics" 
  ON public.clinics 
  FOR SELECT 
  USING (true); -- Permitir visualizar todas as clínicas

DROP POLICY IF EXISTS "Users can create clinics" ON public.clinics;
CREATE POLICY "Users can create clinics" 
  ON public.clinics 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their clinics" ON public.clinics;
CREATE POLICY "Users can update their clinics" 
  ON public.clinics 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Políticas para a tabela specialties
DROP POLICY IF EXISTS "Users can view specialties" ON public.specialties;
CREATE POLICY "Users can view specialties" 
  ON public.specialties 
  FOR SELECT 
  USING (true); -- Permitir visualizar todas as especialidades

DROP POLICY IF EXISTS "Users can create specialties" ON public.specialties;
CREATE POLICY "Users can create specialties" 
  ON public.specialties 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update specialties" ON public.specialties;
CREATE POLICY "Users can update specialties" 
  ON public.specialties 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete specialties" ON public.specialties;
CREATE POLICY "Users can delete specialties" 
  ON public.specialties 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

-- Políticas para user_clinic_associations
DROP POLICY IF EXISTS "Users can view their clinic associations" ON public.user_clinic_associations;
CREATE POLICY "Users can view their clinic associations" 
  ON public.user_clinic_associations 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their clinic associations" ON public.user_clinic_associations;
CREATE POLICY "Users can create their clinic associations" 
  ON public.user_clinic_associations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their clinic associations" ON public.user_clinic_associations;
CREATE POLICY "Users can update their clinic associations" 
  ON public.user_clinic_associations 
  FOR UPDATE 
  USING (auth.uid() = user_id);
