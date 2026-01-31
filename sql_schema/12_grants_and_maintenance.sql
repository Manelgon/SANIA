-- grants_and_maintenance.sql
DO $$ 
BEGIN 
  -- Grants to authenticated
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
  -- Hardening Profiles & Audit
  REVOKE UPDATE, DELETE ON public.profiles FROM authenticated;
  GRANT UPDATE (full_name, avatar_url, phone) ON public.profiles TO authenticated;
  REVOKE UPDATE, DELETE, INSERT ON public.audit_logs FROM authenticated;

  -- Grants to service_role
  GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
END $$;

-- Maintenance
CREATE OR REPLACE FUNCTION public.limpiar_huerfanos_patient_documents()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM storage.objects o WHERE o.bucket_id = 'patient-documents' AND NOT EXISTS (SELECT 1 FROM public.paciente_documentos pd WHERE pd.ruta_storage = o.name);
END; $$;

CREATE OR REPLACE FUNCTION public.reconciliar_pacientes_activos()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pacientes p SET is_active = (u.email_confirmed_at IS NOT NULL) FROM auth.users u WHERE p.user_id = u.id;
END; $$;
