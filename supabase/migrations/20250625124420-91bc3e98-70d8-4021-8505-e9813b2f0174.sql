
-- Criar tabela para armazenar os agendamentos reais
CREATE TABLE IF NOT EXISTS public.appointments_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  price NUMERIC(10,2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'confirmado',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.appointments_schedule ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments_schedule;
CREATE POLICY "Users can view appointments" 
  ON public.appointments_schedule 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments_schedule;
CREATE POLICY "Users can create appointments" 
  ON public.appointments_schedule 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments_schedule;
CREATE POLICY "Users can update appointments" 
  ON public.appointments_schedule 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments_schedule;
CREATE POLICY "Users can delete appointments" 
  ON public.appointments_schedule 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics c 
      WHERE c.id = clinic_id AND c.owner_id = auth.uid()
    )
  );
