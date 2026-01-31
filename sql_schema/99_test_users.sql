-- Script para crear un usuario administrador de prueba
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Primero, necesitas crear el usuario en Supabase Auth manualmente desde el dashboard
--    Ve a: Authentication > Users > Add User
--    Email: admin@sania.com
--    Password: (elige una contraseña segura)
--    Confirm Email: Sí

-- 2. Una vez creado el usuario en Auth, obtén su UUID y ejecuta esto:
-- Reemplaza 'USER_UUID_AQUI' con el UUID real del usuario que creaste

-- Actualizar el perfil para que sea admin
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'Administrador SanIA'
WHERE id = 'USER_UUID_AQUI';

-- Verificar que se creó correctamente
SELECT * FROM public.profiles WHERE role = 'admin';

---

-- ALTERNATIVA: Crear un usuario médico de prueba
-- 1. Crear en Auth: doctor@sania.com
-- 2. Ejecutar:

UPDATE public.profiles 
SET 
  role = 'medico',
  full_name = 'Dr. Juan Pérez'
WHERE id = 'USER_UUID_DEL_DOCTOR';

-- 3. Crear el detalle del facultativo
INSERT INTO public.facultativos_detalle (
  profile_id,
  especialidad,
  num_colegiado
) VALUES (
  'USER_UUID_DEL_DOCTOR',
  'Medicina General',
  'COL-12345'
);

-- 4. Crear una cartera para el doctor
INSERT INTO public.carteras (
  nombre,
  owner_id
) VALUES (
  'Cartera General Adultos',
  'USER_UUID_DEL_DOCTOR'
);
