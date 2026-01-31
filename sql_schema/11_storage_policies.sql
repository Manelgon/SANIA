-- storage_policies.sql
-- Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('patient-documents', 'patient-documents', false),
('facultativos-documentos', 'facultativos-documentos', false),
('avatar_profesionales', 'avatar_profesionales', true)
ON CONFLICT (id) DO NOTHING;

-- Extension storage foldername helper
CREATE OR REPLACE FUNCTION public.puede_acceder_carpeta_paciente(folder_uid text, required_perm text DEFAULT 'leer')
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF public.is_admin() THEN RETURN true; END IF;
  IF folder_uid = auth.uid()::text THEN RETURN (required_perm = 'leer'); END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.pacientes p JOIN public.carteras c ON p.cartera_id = c.id
    WHERE p.user_id::text = folder_uid AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = c.id AND ca.medico_id = auth.uid() AND ((required_perm = 'leer' AND ca.permiso IN ('leer', 'escribir', 'admin')) OR (required_perm = 'escribir' AND ca.permiso IN ('escribir', 'admin')) OR (required_perm = 'admin' AND ca.permiso = 'admin'))))
  );
END; $$;

-- Policies for patient-documents
CREATE POLICY "Upload medico escribir" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'patient-documents' AND public.puede_acceder_carpeta_paciente((storage.foldername(name))[1], 'escribir'));

-- Policies for avatar_profesionales
CREATE POLICY "Avatar select public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatar_profesionales');
CREATE POLICY "Avatar insert own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatar_profesionales' AND (storage.foldername(name))[1] = auth.uid()::text);
