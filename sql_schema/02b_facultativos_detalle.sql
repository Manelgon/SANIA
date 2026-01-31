-- facultativos_detalle.sql
-- Tabla para almacenar información adicional de los facultativos/médicos

CREATE TABLE IF NOT EXISTS public.facultativos_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  especialidad text,
  num_colegiado text,
  cif text,
  direccion text,
  bio text,
  cartera_principal_id uuid REFERENCES public.carteras(id),
  creado_en timestamptz DEFAULT now() NOT NULL,
  actualizado_en timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.facultativos_detalle ENABLE ROW LEVEL SECURITY;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS tr_touch_facultativos_detalle ON public.facultativos_detalle;
CREATE TRIGGER tr_touch_facultativos_detalle 
BEFORE UPDATE ON public.facultativos_detalle 
FOR EACH ROW EXECUTE FUNCTION public.touch_actualizado_en();

-- Policies
DROP POLICY IF EXISTS "Admins ven todos los facultativos" ON public.facultativos_detalle;
CREATE POLICY "Admins ven todos los facultativos" 
ON public.facultativos_detalle FOR SELECT 
USING (public.is_admin());

DROP POLICY IF EXISTS "Facultativos ven su propio detalle" ON public.facultativos_detalle;
CREATE POLICY "Facultativos ven su propio detalle" 
ON public.facultativos_detalle FOR SELECT 
USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Medicos ven otros facultativos" ON public.facultativos_detalle;
CREATE POLICY "Medicos ven otros facultativos" 
ON public.facultativos_detalle FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'medico'));

DROP POLICY IF EXISTS "Admins gestionan facultativos" ON public.facultativos_detalle;
CREATE POLICY "Admins gestionan facultativos" 
ON public.facultativos_detalle FOR ALL 
USING (public.is_admin());

-- Vista para facilitar consultas
DROP VIEW IF EXISTS public.facultativos_detalle_view CASCADE;
CREATE OR REPLACE VIEW public.facultativos_detalle_view AS
SELECT 
  fd.id,
  fd.profile_id,
  p.id as user_id,
  p.full_name,
  p.nombre,
  p.apellido1,
  p.apellido2,
  p.phone,
  p.fid,
  p.role,
  fd.especialidad,
  fd.num_colegiado,
  fd.cif,
  fd.direccion,
  fd.bio,
  fd.cartera_principal_id,
  (SELECT email FROM auth.users WHERE id = p.id) as email,
  fd.creado_en,
  fd.actualizado_en
FROM public.facultativos_detalle fd
JOIN public.profiles p ON p.id = fd.profile_id
WHERE p.role = 'medico';

-- Tabla para documentos del facultativo
CREATE TABLE IF NOT EXISTS public.facultativos_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facultativo_id uuid NOT NULL REFERENCES public.facultativos_detalle(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  tipo text,
  url text NOT NULL,
  storage_path text,
  metadata jsonb DEFAULT '{}',
  creado_por uuid REFERENCES auth.users(id),
  creado_en timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.facultativos_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan documentos facultativos" 
ON public.facultativos_documentos FOR ALL 
USING (public.is_admin());

CREATE POLICY "Medicos ven sus propios documentos" 
ON public.facultativos_documentos FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.facultativos_detalle fd WHERE fd.id = facultativo_id AND fd.profile_id = auth.uid()));

-- Indices
CREATE INDEX IF NOT EXISTS idx_facultativos_detalle_profile ON public.facultativos_detalle(profile_id);
CREATE INDEX IF NOT EXISTS idx_facultativos_detalle_cartera ON public.facultativos_detalle(cartera_principal_id);
CREATE INDEX IF NOT EXISTS idx_facultativos_documentos_facultativo ON public.facultativos_documentos(facultativo_id);
