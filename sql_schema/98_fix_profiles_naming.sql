-- migration_fix_profiles_naming.sql
-- Add missing columns to profiles table if they don't exist

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'nombre') THEN
        ALTER TABLE public.profiles ADD COLUMN nombre text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'apellido1') THEN
        ALTER TABLE public.profiles ADD COLUMN apellido1 text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'apellido2') THEN
        ALTER TABLE public.profiles ADD COLUMN apellido2 text;
    END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('nombre', 'apellido1', 'apellido2');
