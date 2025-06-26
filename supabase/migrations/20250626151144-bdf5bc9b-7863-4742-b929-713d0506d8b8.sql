
-- Remover todas as políticas existentes da tabela specialties
DROP POLICY IF EXISTS "Users can view specialties" ON public.specialties;
DROP POLICY IF EXISTS "Users can create specialties" ON public.specialties;
DROP POLICY IF EXISTS "Users can update specialties" ON public.specialties;
DROP POLICY IF EXISTS "Users can delete specialties" ON public.specialties;

-- Criar políticas mais permissivas para specialties
-- Permitir visualizar todas as especialidades (necessário para funcionamento do sistema)
CREATE POLICY "Anyone can view specialties" 
  ON public.specialties 
  FOR SELECT 
  USING (true);

-- Permitir inserir especialidades para usuários autenticados
CREATE POLICY "Authenticated users can create specialties" 
  ON public.specialties 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir atualizar especialidades para usuários autenticados
CREATE POLICY "Authenticated users can update specialties" 
  ON public.specialties 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Permitir deletar especialidades para usuários autenticados
CREATE POLICY "Authenticated users can delete specialties" 
  ON public.specialties 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);
