
-- Remover políticas existentes para clinic_patients
DROP POLICY IF EXISTS "Users can view patients for their clinics" ON public.clinic_patients;
DROP POLICY IF EXISTS "Users can create patients for their clinics" ON public.clinic_patients;
DROP POLICY IF EXISTS "Users can update patients for their clinics" ON public.clinic_patients;
DROP POLICY IF EXISTS "Users can delete patients for their clinics" ON public.clinic_patients;

-- Remover políticas existentes para clinic_doctors
DROP POLICY IF EXISTS "Users can view doctors for their clinics" ON public.clinic_doctors;
DROP POLICY IF EXISTS "Users can create doctors for their clinics" ON public.clinic_doctors;
DROP POLICY IF EXISTS "Users can update doctors for their clinics" ON public.clinic_doctors;
DROP POLICY IF EXISTS "Users can delete doctors for their clinics" ON public.clinic_doctors;

-- Criar novas políticas para clinic_patients usando user_clinic_associations
CREATE POLICY "Users can view patients for associated clinics" 
  ON public.clinic_patients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_patients.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create patients for associated clinics" 
  ON public.clinic_patients 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_patients.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update patients for associated clinics" 
  ON public.clinic_patients 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_patients.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete patients for associated clinics" 
  ON public.clinic_patients 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_patients.clinic_id AND uca.user_id = auth.uid()
    )
  );

-- Criar novas políticas para clinic_doctors usando user_clinic_associations
CREATE POLICY "Users can view doctors for associated clinics" 
  ON public.clinic_doctors 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_doctors.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create doctors for associated clinics" 
  ON public.clinic_doctors 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_doctors.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update doctors for associated clinics" 
  ON public.clinic_doctors 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_doctors.clinic_id AND uca.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete doctors for associated clinics" 
  ON public.clinic_doctors 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_clinic_associations uca 
      WHERE uca.clinic_id = clinic_doctors.clinic_id AND uca.user_id = auth.uid()
    )
  );
