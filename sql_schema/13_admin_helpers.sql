-- admin_helpers.sql
-- Función para que un administrador pueda crear médicos directamente

-- Necesario para crypt() y gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.admin_create_doctor(
  p_email text,
  p_nombre text,
  p_apellido1 text,
  p_apellido2 text DEFAULT NULL,
  p_especialidad text DEFAULT NULL,
  p_num_colegiado text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_cif text DEFAULT NULL,
  p_direccion text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_especialidad_id uuid DEFAULT NULL,
  p_password text DEFAULT 'Sania123!'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $func$
DECLARE
  new_user_id uuid;
  v_full_name text;
BEGIN
  -- 1. Verificar si el que llama es admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear facultativos.';
  END IF;

  v_full_name := trim(p_nombre || ' ' || p_apellido1 || ' ' || COALESCE(p_apellido2, ''));

  -- 2. Crear el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    format('{"full_name":"%s"}', v_full_name)::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- 3. Actualizar el perfil
  UPDATE public.profiles 
  SET 
    role = 'medico',
    full_name = v_full_name,
    nombre = p_nombre,
    apellido1 = p_apellido1,
    apellido2 = p_apellido2,
    phone = p_phone
  WHERE id = new_user_id;

  -- 4. Crear el detalle del facultativo
  INSERT INTO public.facultativos_detalle (
    profile_id,
    especialidad,
    num_colegiado,
    cif,
    direccion,
    bio,
    especialidad_id
  ) VALUES (
    new_user_id,
    p_especialidad,
    p_num_colegiado,
    p_cif,
    p_direccion,
    p_bio,
    p_especialidad_id
  );

  RETURN new_user_id;
END;
$func$;

-- Aseguramos los permisos (usando los mismos tipos para coincidir con la firma)
ALTER FUNCTION public.admin_create_doctor(text, text, text, text, text, text, text, text, text, text, uuid, text) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.admin_create_doctor(text, text, text, text, text, text, text, text, text, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_doctor(text, text, text, text, text, text, text, text, text, text, uuid, text) TO authenticated;
