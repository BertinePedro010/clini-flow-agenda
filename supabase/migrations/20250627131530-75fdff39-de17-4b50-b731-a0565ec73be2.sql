
-- Remover políticas existentes da tabela appointments_schedule
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments_schedule;
DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments_schedule;

-- Criar novas políticas para appointments_schedule usando user_clinic_associations
CREATE POLICY "Users can view appointments for associated clinics" 
  ON public.appointments_schedule 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = appointments_schedule.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments for associated clinics" 
  ON public.appointments_schedule 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = appointments_schedule.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments for associated clinics" 
  ON public.appointments_schedule 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = appointments_schedule.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments for associated clinics" 
  ON public.appointments_schedule 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = appointments_schedule.clinic_id AND uca.user_id = auth.uid()
    )
  );
