-- 15_facultativo_helpers.sql

-- Función para que un facultativo pueda crear pacientes en su cartera
-- Requiere pgcrypto (ya habilitado en 13_admin_helpers.sql)

CREATE OR REPLACE FUNCTION public.facultativo_create_patient(
  p_nombre text,
  p_apellido1 text,
  p_apellido2 text,
  p_dni text,
  p_email text,
  p_password text,
  p_telefono text DEFAULT NULL,
  p_direccion text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_sex text DEFAULT NULL,
  p_blood_group text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_medico_id uuid;
  v_cartera_id uuid;
  v_user_id uuid;
  v_patient_id uuid;
BEGIN
  v_medico_id := auth.uid();

  -- 1. Verificar que el médico tiene una cartera propia (o permiso de escritura en alguna)
  -- Simplificación: Usamos la cartera PROPIA del médico (owner_id)
  SELECT id INTO v_cartera_id
  FROM public.carteras
  WHERE owner_id = v_medico_id
  LIMIT 1;

  IF v_cartera_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró una cartera asignada a este facultativo.';
  END IF;

  -- 2. Crear usuario en Auth (similar a admin_create_doctor)
  -- Nota: Esto crea el usuario confirmado por defecto.
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
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated', -- Role POSTGRES (auth.role)
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'full_name', p_nombre || ' ' || p_apellido1 || COALESCE(' ' || p_apellido2, ''),
      'role', 'paciente' -- Rol APLICACION
    ),
    now(),
    now()
  ) RETURNING id INTO v_user_id;

  -- 3. Crear Profile (se crea por trigger en auth.users, pero lo actualizamos)
  -- El trigger on_auth_user_created inserta en public.profiles.
  -- Esperamos a que el trigger termine o hacemos update directo si ya existe.
  -- Como es SECURITY DEFINER, tenemos permisos.
  
  -- Aseguramos role 'paciente' en el profile
  UPDATE public.profiles
  SET 
    role = 'paciente',
    full_name = p_nombre || ' ' || p_apellido1 || COALESCE(' ' || p_apellido2, '')
  WHERE id = v_user_id;

  -- 4. Crear Registro en Pacientes vinculado a la cartera
  INSERT INTO public.pacientes (
    user_id,
    cartera_id,
    nombre,
    apellido1,
    apellido2,
    dni,
    direccion_texto,
    telefono_principal,
    blood_group,
    sex,
    birth_date
  ) VALUES (
    v_user_id,
    v_cartera_id,
    p_nombre,
    p_apellido1,
    p_apellido2,
    p_dni,
    p_direccion,
    p_telefono,
    p_blood_group,
    p_sex,
    p_birth_date
  ) RETURNING id INTO v_patient_id;

  RETURN v_patient_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.facultativo_create_patient(text, text, text, text, text, text, text, text, date, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.facultativo_create_patient(text, text, text, text, text, text, text, text, date, text, text) TO service_role;
