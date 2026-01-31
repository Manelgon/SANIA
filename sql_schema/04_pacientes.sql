-- pacientes.sql
CREATE TABLE IF NOT EXISTS public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id),
  cartera_id uuid NOT NULL REFERENCES public.carteras(id),
  nombre TEXT,
  apellido1 TEXT,
  apellido2 TEXT,
  dni TEXT,
  direccion_texto TEXT,
  telefono_principal TEXT,
  blood_group TEXT,
  sex TEXT,
  birth_date DATE,
  is_active BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Helpers de Acceso
CREATE OR REPLACE FUNCTION public.puede_ver_paciente(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.pacientes p
    JOIN public.carteras cart ON p.cartera_id = cart.id
    WHERE p.id = p_id
    AND (
      cart.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = cart.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('leer', 'escribir', 'admin'))
      OR p.user_id = auth.uid()
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.puede_escribir_paciente(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.pacientes p
    JOIN public.carteras cart ON p.cartera_id = cart.id
    WHERE p.id = p_id
    AND (
      cart.owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = cart.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('escribir', 'admin'))
    )
  );
END;
$$;

-- Triggers
CREATE OR REPLACE FUNCTION public.validar_insert_paciente()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.carteras c
      WHERE c.id = NEW.cartera_id
      AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = c.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('escribir', 'admin')))
    ) THEN
      RAISE EXCEPTION 'Operación no permitida: sin acceso a la cartera.';
    END IF;
    IF NEW.user_id IS NOT NULL THEN RAISE EXCEPTION 'Operación no permitida: asignación de user_id restringida.'; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_validar_insert_paciente ON public.pacientes;
CREATE TRIGGER tr_validar_insert_paciente BEFORE INSERT ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.validar_insert_paciente();

-- Activation Sync
CREATE OR REPLACE FUNCTION public.sync_patient_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.pacientes SET is_active = (NEW.email_confirmed_at IS NOT NULL) WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Policies
CREATE POLICY "Ver pacientes autorizados" ON public.pacientes FOR SELECT USING (public.puede_ver_paciente(id));
CREATE POLICY "Admin o medicos autorizados pueden insertar" ON public.pacientes FOR INSERT WITH CHECK (public.is_admin() OR EXISTS (SELECT 1 FROM public.carteras c WHERE c.id = cartera_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = c.id AND ca.medico_id = auth.uid() AND ca.permiso IN ('escribir', 'admin')))));

-- Indices
CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON public.pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cartera_id ON public.pacientes(cartera_id);
