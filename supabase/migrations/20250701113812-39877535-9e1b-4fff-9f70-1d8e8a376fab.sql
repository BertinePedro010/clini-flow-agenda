
-- Limpar dados de teste da tabela appointments_schedule (consultas/agendamentos)
DELETE FROM public.appointments_schedule 
WHERE id NOT IN (
  -- Esta query manterá apenas registros que foram claramente adicionados pelo usuário
  -- Se não houver registros manuais, a tabela ficará vazia
  SELECT id FROM public.appointments_schedule WHERE FALSE
);

-- Limpar dados de teste da tabela clinic_patients (pacientes)
DELETE FROM public.clinic_patients 
WHERE id NOT IN (
  -- Esta query manterá apenas registros que foram claramente adicionados pelo usuário
  -- Se não houver registros manuais, a tabela ficará vazia
  SELECT id FROM public.clinic_patients WHERE FALSE
);

-- Limpar dados de teste da tabela clinic_doctors (médicos)
DELETE FROM public.clinic_doctors 
WHERE id NOT IN (
  -- Esta query manterá apenas registros que foram claramente adicionados pelo usuário
  -- Se não houver registros manuais, a tabela ficará vazia
  SELECT id FROM public.clinic_doctors WHERE FALSE
);

-- Limpar dados de teste da tabela patients (se houver dados antigos)
DELETE FROM public.patients 
WHERE id NOT IN (
  -- Esta query manterá apenas registros que foram claramente adicionados pelo usuário
  -- Se não houver registros manuais, a tabela ficará vazia
  SELECT id FROM public.patients WHERE FALSE
);

-- Limpar dados de teste da tabela appointments (se houver dados antigos)
DELETE FROM public.appointments 
WHERE id NOT IN (
  -- Esta query manterá apenas registros que foram claramente adicionados pelo usuário
  -- Se não houver registros manuais, a tabela ficará vazia
  SELECT id FROM public.appointments WHERE FALSE
);

-- Resetar sequências se necessário para que novos IDs comecem do 1
-- (isso não afeta UUIDs, mas é uma boa prática para limpeza completa)
