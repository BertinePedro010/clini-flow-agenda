
-- Remover políticas existentes da tabela appointments_schedule
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments_schedule;

-- Criar políticas mais permissivas para appointments_schedule
CREATE POLICY "Users can view appointments for their clinics" 
  ON public.appointments_schedule 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments for their clinics" 
  ON public.appointments_schedule 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments for their clinics" 
  ON public.appointments_schedule 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments for their clinics" 
  ON public.appointments_schedule 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

-- Também vamos criar tabelas para armazenar pacientes e médicos cadastrados
CREATE TABLE IF NOT EXISTS public.clinic_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinic_doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  crm TEXT,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.clinic_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_doctors ENABLE ROW LEVEL SECURITY;

-- Políticas para clinic_patients
CREATE POLICY "Users can view patients for their clinics" 
  ON public.clinic_patients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients for their clinics" 
  ON public.clinic_patients 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update patients for their clinics" 
  ON public.clinic_patients 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patients for their clinics" 
  ON public.clinic_patients 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

-- Políticas para clinic_doctors
CREATE POLICY "Users can view doctors for their clinics" 
  ON public.clinic_doctors 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create doctors for their clinics" 
  ON public.clinic_doctors 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update doctors for their clinics" 
  ON public.clinic_doctors 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete doctors for their clinics" 
  ON public.clinic_doctors 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );
