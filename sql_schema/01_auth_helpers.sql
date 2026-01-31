-- helper_functions.sql
-- Extensiones
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- is_admin Hardening
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;
ALTER FUNCTION public.is_admin() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

-- Generic Timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.set_updated_at() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.touch_actualizado_en()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.touch_actualizado_en() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.touch_actualizado_en() FROM PUBLIC;
