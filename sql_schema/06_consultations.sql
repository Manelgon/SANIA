-- consultations.sql
CREATE TABLE IF NOT EXISTS public.consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES auth.users(id),
  fecha timestamptz NOT NULL DEFAULT now(),
  motivo text,
  notas text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id uuid NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES auth.users(id),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medicacion text,
  instrucciones text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pruebas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id uuid NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES auth.users(id),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nombre_prueba text,
  resultados text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultas_diagnosticos (
  consulta_id uuid NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  diagnostico_id uuid NOT NULL REFERENCES public.diagnosticos(id) ON DELETE CASCADE,
  PRIMARY KEY (consulta_id, diagnostico_id)
);

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pruebas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_diagnosticos ENABLE ROW LEVEL SECURITY;

-- Sync Helper
CREATE OR REPLACE FUNCTION public.sync_paciente_id_desde_consulta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  SELECT c.paciente_id INTO NEW.paciente_id FROM public.consultas c WHERE c.id = NEW.consulta_id;
  IF NEW.paciente_id IS NULL THEN RAISE EXCEPTION 'consulta_id inválida o inexistente (%)', NEW.consulta_id; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_sync_paciente_id_recetas BEFORE INSERT OR UPDATE OF consulta_id ON public.recetas FOR EACH ROW EXECUTE FUNCTION public.sync_paciente_id_desde_consulta();
CREATE TRIGGER tr_sync_paciente_id_pruebas BEFORE INSERT OR UPDATE OF consulta_id ON public.pruebas FOR EACH ROW EXECUTE FUNCTION public.sync_paciente_id_desde_consulta();

-- Policies
CREATE POLICY "Ver consultas" ON public.consultas FOR SELECT USING (public.puede_ver_consulta(id));
CREATE POLICY "Medicos crean consultas" ON public.consultas FOR INSERT WITH CHECK (medico_id = auth.uid() AND public.puede_escribir_paciente(paciente_id));
CREATE POLICY "Medicos editan sus consultas" ON public.consultas FOR UPDATE USING (public.puede_escribir_consulta(id));

CREATE POLICY "Ver recetas" ON public.recetas FOR SELECT USING (public.puede_ver_consulta(consulta_id));
CREATE POLICY "Ver pruebas" ON public.pruebas FOR SELECT USING (public.puede_ver_consulta(consulta_id));

-- Indices
CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON public.consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON public.consultas(fecha);
CREATE INDEX IF NOT EXISTS idx_recetas_consulta ON public.recetas(consulta_id);
CREATE INDEX IF NOT EXISTS idx_pruebas_consulta ON public.pruebas(consulta_id);
