-- clinical_base.sql
-- Catálogo CIE-10-ES 2026
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  descripcion text NOT NULL,
  nodo_final boolean DEFAULT false,
  manifestacion boolean DEFAULT false,
  perinatal boolean DEFAULT false,
  pediatrico boolean DEFAULT false,
  obstetrico boolean DEFAULT false,
  adulto boolean DEFAULT false,
  mujer boolean DEFAULT false,
  hombre boolean DEFAULT false,
  poa_exento boolean DEFAULT false,
  dp_no_principal boolean DEFAULT false,
  vcdp boolean DEFAULT false,
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patologias_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text,
  nombre text NOT NULL,
  sistema text NOT NULL DEFAULT 'custom',
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sistema, codigo),
  UNIQUE (sistema, nombre)
);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patologias_catalogo ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.puede_ver_consulta(p_consulta_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.consultas c
    JOIN public.pacientes p ON c.paciente_id = p.id
    JOIN public.carteras cart ON p.cartera_id = cart.id
    WHERE c.id = p_consulta_id
    AND (c.medico_id = auth.uid() OR cart.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = cart.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('leer', 'escribir', 'admin')) OR p.user_id = auth.uid())
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.puede_escribir_consulta(p_consulta_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.consultas c
    JOIN public.pacientes p ON c.paciente_id = p.id
    JOIN public.carteras cart ON p.cartera_id = cart.id
    WHERE c.id = p_consulta_id
    AND (c.medico_id = auth.uid() OR cart.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = cart.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('escribir', 'admin')))
  );
END;
$$;

-- Policies
CREATE POLICY "Lectura publica diagnosticos" ON public.diagnosticos FOR SELECT TO authenticated USING (activo = true);
CREATE POLICY "Leer patologias activas" ON public.patologias_catalogo FOR SELECT TO authenticated USING (activo = true);
