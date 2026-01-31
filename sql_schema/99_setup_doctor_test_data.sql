-- Script simplificado para configurar el usuario doctor@sania.com
-- Ejecuta esto en el SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASO 1: Crear la tabla facultativos_detalle si no existe
-- (Asegúrate de haber ejecutado 02b_facultativos_detalle.sql primero)

-- PASO 2: Asegurar que el registro en profiles existe
-- Este paso es necesario si el usuario se creó desde el Dashboard sin trigger de sincronización
INSERT INTO public.profiles (id, role, full_name, phone)
VALUES ('be172d1d-bb8a-4f58-b539-3dd0c98dc88d', 'medico', 'Dr. Juan Pérez García', '612345678')
ON CONFLICT (id) DO UPDATE SET
  role = 'medico',
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- PASO 3: Crear el detalle del facultativo
INSERT INTO public.facultativos_detalle (
  profile_id,
  especialidad,
  num_colegiado,
  bio
) VALUES (
  'be172d1d-bb8a-4f58-b539-3dd0c98dc88d',
  'Medicina General',
  'COL-12345',
  'Médico especialista en medicina general con 10 años de experiencia'
)
ON CONFLICT (profile_id) DO UPDATE SET
  especialidad = EXCLUDED.especialidad,
  num_colegiado = EXCLUDED.num_colegiado,
  bio = EXCLUDED.bio;

-- PASO 4: Crear una cartera para el doctor
INSERT INTO public.carteras (
  nombre,
  owner_id
) 
SELECT 
  'Cartera General Adultos',
  'be172d1d-bb8a-4f58-b539-3dd0c98dc88d'
WHERE NOT EXISTS (
  SELECT 1 FROM public.carteras 
  WHERE owner_id = 'be172d1d-bb8a-4f58-b539-3dd0c98dc88d'
);

-- PASO 5: Verificar que todo está correcto
SELECT 
  p.id,
  p.role,
  p.full_name,
  p.fid,
  fd.especialidad,
  fd.num_colegiado,
  c.nombre as cartera
FROM public.profiles p
LEFT JOIN public.facultativos_detalle fd ON fd.profile_id = p.id
LEFT JOIN public.carteras c ON c.owner_id = p.id
WHERE p.id = 'be172d1d-bb8a-4f58-b539-3dd0c98dc88d';

-- PASO 6: Crear pacientes de prueba
DO $$
DECLARE
  v_cartera_id uuid;
BEGIN
  SELECT id INTO v_cartera_id 
  FROM public.carteras 
  WHERE owner_id = 'be172d1d-bb8a-4f58-b539-3dd0c98dc88d' 
  LIMIT 1;

  IF v_cartera_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró la cartera del doctor';
  END IF;

  INSERT INTO public.pacientes (
    cartera_id,
    nombre,
    apellido1,
    apellido2,
    dni,
    telefono_principal,
    blood_group,
    sex,
    birth_date
  ) VALUES 
  (
    v_cartera_id,
    'María',
    'González',
    'López',
    '12345678A',
    '611222333',
    'A+',
    'F',
    '1985-03-15'
  ),
  (
    v_cartera_id,
    'Carlos',
    'Ruiz',
    'Martínez',
    '87654321B',
    '622333444',
    'O+',
    'M',
    '1978-07-22'
  ),
  (
    v_cartera_id,
    'Ana',
    'Martínez',
    'Fernández',
    '11223344C',
    '633444555',
    'B+',
    'F',
    '1990-11-08'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- PASO 7: Crear citas de prueba para hoy
DO $$
DECLARE
  v_agenda_id uuid;
  v_paciente1_id uuid;
  v_paciente2_id uuid;
  v_paciente3_id uuid;
  v_hoy timestamptz := CURRENT_DATE::timestamptz;
BEGIN
  -- Obtener o crear agenda
  SELECT id INTO v_agenda_id 
  FROM public.agendas 
  WHERE medico_id = 'be172d1d-bb8a-4f58-b539-3dd0c98dc88d' 
  LIMIT 1;

  IF v_agenda_id IS NULL THEN
    -- El trigger tr_crear_agenda_principal_si_medico debería haberla creado,
    -- pero por si acaso la creamos aquí
    INSERT INTO public.agendas (medico_id, nombre) 
    VALUES ('be172d1d-bb8a-4f58-b539-3dd0c98dc88d', 'Agenda principal')
    RETURNING id INTO v_agenda_id;
  END IF;

  -- Obtener IDs de pacientes
  SELECT id INTO v_paciente1_id FROM public.pacientes WHERE nombre = 'María' AND apellido1 = 'González' LIMIT 1;
  SELECT id INTO v_paciente2_id FROM public.pacientes WHERE nombre = 'Carlos' AND apellido1 = 'Ruiz' LIMIT 1;
  SELECT id INTO v_paciente3_id FROM public.pacientes WHERE nombre = 'Ana' AND apellido1 = 'Martínez' LIMIT 1;

  -- Insertar citas
  INSERT INTO public.citas (
    agenda_id,
    paciente_id,
    medico_id,
    inicio,
    fin,
    motivo,
    estado
  ) VALUES 
  (
    v_agenda_id,
    v_paciente1_id,
    'be172d1d-bb8a-4f58-b539-3dd0c98dc88d',
    v_hoy + INTERVAL '9 hours',
    v_hoy + INTERVAL '9 hours 30 minutes',
    'Revisión anual',
    'realizada'
  ),
  (
    v_agenda_id,
    v_paciente2_id,
    'be172d1d-bb8a-4f58-b539-3dd0c98dc88d',
    v_hoy + INTERVAL '9 hours 30 minutes',
    v_hoy + INTERVAL '10 hours',
    'Consulta general',
    'realizada'
  ),
  (
    v_agenda_id,
    v_paciente3_id,
    'be172d1d-bb8a-4f58-b539-3dd0c98dc88d',
    v_hoy + INTERVAL '10 hours',
    v_hoy + INTERVAL '10 hours 30 minutes',
    'Seguimiento',
    'programada'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- PASO 8: Verificar las citas creadas
SELECT 
  c.inicio::time as hora,
  c.motivo,
  c.estado,
  p.nombre || ' ' || p.apellido1 as paciente
FROM public.citas c
JOIN public.pacientes p ON p.id = c.paciente_id
WHERE c.medico_id = 'be172d1d-bb8a-4f58-b539-3dd0c98dc88d'
  AND DATE(c.inicio) = CURRENT_DATE
ORDER BY c.inicio;
