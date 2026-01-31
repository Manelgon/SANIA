-- patient_records.sql
-- Alergias
CREATE TABLE IF NOT EXISTS public.paciente_alergias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  descripcion text,
  creado_en timestamptz DEFAULT now()
);

-- Antecedentes
CREATE TABLE IF NOT EXISTS public.paciente_antecedentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('patologia', 'cirugia', 'alergia', 'medicacion_cronica', 'habito', 'familiar', 'otro')),
  patologia_id uuid REFERENCES public.patologias_catalogo(id),
  descripcion text,
  fecha_inicio date,
  fecha_fin date,
  activo boolean NOT NULL DEFAULT true,
  severidad text CHECK (severidad IN ('leve','moderada','grave')),
  fuente text CHECK (fuente IN ('paciente','medico','importado')) DEFAULT 'medico',
  creado_por uuid REFERENCES auth.users(id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_patologia_si_tipo CHECK ((tipo <> 'patologia' AND patologia_id IS NULL) OR (tipo = 'patologia' AND patologia_id IS NOT NULL))
);

-- Documentos
CREATE TABLE IF NOT EXISTS public.paciente_documentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  url text,
  ruta_storage text NOT NULL,
  tipo text CHECK (tipo IN ('analitica', 'imagen', 'informe', 'receta', 'otro')) DEFAULT 'otro',
  creado_en timestamptz DEFAULT now(),
  es_firmado BOOLEAN DEFAULT false,
  firmado_en TIMESTAMPTZ,
  expira_en TIMESTAMPTZ,
  codigo_identificador TEXT,
  metadatos JSONB DEFAULT '{}'::jsonb,
  estado_subida text NOT NULL DEFAULT 'ok' CHECK (estado_subida IN ('pendiente','ok','error'))
);

ALTER TABLE public.paciente_alergias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente_antecedentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente_documentos ENABLE ROW LEVEL SECURITY;

-- Helpers & Triggers
CREATE OR REPLACE FUNCTION public.set_creado_por()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.is_admin() OR auth.role() = 'service_role' THEN
    IF NEW.creado_por IS NULL THEN NEW.creado_por := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid); END IF;
    RETURN NEW;
  END IF;
  NEW.creado_por := auth.uid(); RETURN NEW;
END; $$;

CREATE TRIGGER tr_set_creado_por_antecedentes BEFORE INSERT ON public.paciente_antecedentes FOR EACH ROW EXECUTE FUNCTION public.set_creado_por();
CREATE TRIGGER tr_set_updated_at_antecedentes BEFORE UPDATE ON public.paciente_antecedentes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Policies
CREATE POLICY "Ver sus alergias" ON public.paciente_alergias FOR SELECT USING (public.puede_ver_paciente(paciente_id));
CREATE POLICY "Ver sus antecedentes" ON public.paciente_antecedentes FOR SELECT USING (public.puede_ver_paciente(paciente_id));
CREATE POLICY "Ver sus documentos" ON public.paciente_documentos FOR SELECT USING (public.puede_ver_paciente(paciente_id));

-- Indices
CREATE INDEX IF NOT EXISTS idx_alergias_paciente ON public.paciente_alergias(paciente_id);
CREATE INDEX IF NOT EXISTS idx_antecedentes_paciente ON public.paciente_antecedentes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON public.paciente_documentos(paciente_id);
