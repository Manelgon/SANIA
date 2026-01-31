-- audit_system.sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  actor_role text,
  actor_ip inet,
  actor_user_agent text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  paciente_id uuid,
  cartera_id uuid,
  description text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM authenticated, service_role;

-- Log Event Function
CREATE OR REPLACE FUNCTION public.log_event(p_action text, p_resource_type text, p_resource_id uuid DEFAULT NULL, p_paciente_id uuid DEFAULT NULL, p_cartera_id uuid DEFAULT NULL, p_description text DEFAULT NULL, p_old_data jsonb DEFAULT NULL, p_new_data jsonb DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_role text; v_ua text; v_enabled text;
BEGIN
  v_enabled := current_setting('app.audit_enabled', true);
  IF v_enabled IS DISTINCT FROM '1' THEN RETURN; END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  v_role := COALESCE(v_role, auth.role());
  BEGIN v_ua := NULLIF(COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', ''), ''); EXCEPTION WHEN OTHERS THEN v_ua := 'Desconocido'; END;
  INSERT INTO public.audit_logs (actor_user_id, actor_role, actor_ip, actor_user_agent, action, resource_type, resource_id, paciente_id, cartera_id, description, old_data, new_data)
  VALUES (auth.uid(), v_role, inet_client_addr(), COALESCE(v_ua, 'Desconocido'), p_action, p_resource_type, p_resource_id, p_paciente_id, p_cartera_id, p_description, p_old_data, p_new_data);
END; $$;

-- Triggers (Examples)
CREATE OR REPLACE FUNCTION public.audit_pacientes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('app.audit_enabled', '1', true);
  IF TG_OP = 'INSERT' THEN PERFORM public.log_event('INSERT', 'pacientes', NEW.id, NEW.id, NEW.cartera_id, 'Alta de paciente', NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN PERFORM public.log_event('UPDATE', 'pacientes', NEW.id, NEW.id, NEW.cartera_id, 'Actualización de paciente', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN PERFORM public.log_event('DELETE', 'pacientes', OLD.id, OLD.id, OLD.cartera_id, 'Borrado de paciente', to_jsonb(OLD), NULL); END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER tr_audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.audit_pacientes();

-- 2. Consultas
CREATE OR REPLACE FUNCTION public.audit_consultas() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('app.audit_enabled', '1', true);
  IF TG_OP = 'INSERT' THEN PERFORM public.log_event('INSERT', 'consultas', NEW.id, NEW.paciente_id, NULL, 'Nueva consulta abierta', NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN PERFORM public.log_event('UPDATE', 'consultas', NEW.id, NEW.paciente_id, NULL, 'Modificación de consulta', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN PERFORM public.log_event('DELETE', 'consultas', OLD.id, OLD.paciente_id, NULL, 'Borrado de consulta', to_jsonb(OLD), NULL); END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER tr_audit_consultas AFTER INSERT OR UPDATE OR DELETE ON public.consultas FOR EACH ROW EXECUTE FUNCTION public.audit_consultas();

-- 3. Documentos
CREATE OR REPLACE FUNCTION public.audit_paciente_documentos() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('app.audit_enabled', '1', true);
  IF TG_OP = 'INSERT' THEN PERFORM public.log_event('INSERT', 'paciente_documentos', NEW.id, NEW.paciente_id, NULL, 'Nuevo documento subido', NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN PERFORM public.log_event('UPDATE', 'paciente_documentos', NEW.id, NEW.paciente_id, NULL, 'Modificación de documento', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN PERFORM public.log_event('DELETE', 'paciente_documentos', OLD.id, OLD.paciente_id, NULL, 'Borrado de documento', to_jsonb(OLD), NULL); END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER tr_audit_paciente_documentos AFTER INSERT OR UPDATE OR DELETE ON public.paciente_documentos FOR EACH ROW EXECUTE FUNCTION public.audit_paciente_documentos();

-- Indices
CREATE INDEX IF NOT EXISTS idx_audit_logs_paciente ON public.audit_logs(paciente_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at desc);
