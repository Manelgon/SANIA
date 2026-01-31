-- profiles.sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'medico', 'paciente')) DEFAULT 'paciente',
  full_name text,
  nombre text,
  apellido1 text,
  apellido2 text,
  avatar_url text,
  phone text,
  fid text UNIQUE,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RBAC Protection
CREATE OR REPLACE FUNCTION public.bloquear_update_role_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'No permitido cambiar role (privilege escalation blocked)';
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.bloquear_update_role_profiles() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.bloquear_update_role_profiles() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_bloquear_update_role_profiles ON public.profiles;
CREATE TRIGGER tr_bloquear_update_role_profiles
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.bloquear_update_role_profiles();

-- FID Logic
CREATE SEQUENCE IF NOT EXISTS public.facultativo_fid_seq START 1;

CREATE OR REPLACE FUNCTION public.generar_fid_facultativo()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  n BIGINT;
BEGIN
  n := nextval('public.facultativo_fid_seq');
  RETURN 'FID-' || lpad(n::text, 9, '0');
END;
$$;
ALTER FUNCTION public.generar_fid_facultativo() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.generar_fid_facultativo() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.asignar_fid_si_medico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role = 'medico' AND (NEW.fid IS NULL OR NEW.fid = '') THEN
    NEW.fid := public.generar_fid_facultativo();
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.asignar_fid_si_medico() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.asignar_fid_si_medico() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_asignar_fid_si_medico ON public.profiles;
CREATE TRIGGER tr_asignar_fid_si_medico
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.asignar_fid_si_medico();

-- Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_safe" ON public.profiles;
CREATE POLICY "profiles_update_own_safe" ON public.profiles FOR UPDATE
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());
