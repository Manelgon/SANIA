-- 14_especialidades.sql
-- Tabla para normalizar las especialidades médicas

CREATE TABLE IF NOT EXISTS public.especialidades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text UNIQUE NOT NULL,
    creado_en timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer especialidades (o al menos autenticados)
CREATE POLICY "Especialidades legibles por todos" 
ON public.especialidades FOR SELECT 
TO authenticated
USING (true);

-- Solo admins pueden gestionar especialidades
CREATE POLICY "Admins gestionan especialidades" 
ON public.especialidades FOR ALL 
TO authenticated
USING (public.is_admin());

-- Semilla de especialidades comunes
INSERT INTO public.especialidades (nombre)
VALUES 
    ('Medicina Familiar y Comunitaria'),
    ('Pediatría'),
    ('Ginecología y Obstetricia'),
    ('Cardiología'),
    ('Dermatología'),
    ('Oftalmología'),
    ('Otorrinolaringología'),
    ('Traumatología y Cirugía Ortopédica'),
    ('Psiquiatría'),
    ('Urología'),
    ('Neurología'),
    ('Endocrinología y Nutrición'),
    ('Gastroenterología'),
    ('Oncología Médica'),
    ('Radiología'),
    ('Anestesiología'),
    ('Medicina Interna'),
    ('Enfermería General'),
    ('Psicología Clínica'),
    ('Fisioterapia')
ON CONFLICT (nombre) DO NOTHING;

-- Actualizar facultativos_detalle para soportar FK a especialidades
ALTER TABLE public.facultativos_detalle 
ADD COLUMN IF NOT EXISTS especialidad_id uuid REFERENCES public.especialidades(id);

-- Opcional: Intentar migrar datos existentes de texto a IDs si coinciden exactamente
DO $$
BEGIN
    UPDATE public.facultativos_detalle fd
    SET especialidad_id = e.id
    FROM public.especialidades e
    WHERE fd.especialidad = e.nombre
    AND fd.especialidad_id IS NULL;
END $$;
