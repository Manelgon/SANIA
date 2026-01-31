-- agendas_citas.sql
CREATE TABLE IF NOT EXISTS public.agendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre text NOT NULL DEFAULT 'Agenda principal',
  timezone text NOT NULL DEFAULT 'Europe/Madrid',
  duracion_cita_min int NOT NULL DEFAULT 20 CHECK (duracion_cita_min BETWEEN 5 AND 240),
  buffer_min int NOT NULL DEFAULT 0 CHECK (buffer_min BETWEEN 0 AND 60),
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agenda_disponibilidad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  dow int NOT NULL CHECK (dow BETWEEN 0 AND 6),
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (hora_fin > hora_inicio)
);

CREATE TABLE IF NOT EXISTS public.agenda_bloqueos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  motivo text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);

CREATE TABLE IF NOT EXISTS public.citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  motivo text,
  estado text NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada','confirmada','realizada','cancelada','no_asiste')),
  cancelado_por uuid REFERENCES auth.users(id),
  motivo_cancelacion text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);

-- Exclusión de solapamiento
CREATE INDEX IF NOT EXISTS idx_citas_medico_rango ON public.citas USING gist (medico_id, tstzrange(inicio, fin, '[)'));
ALTER TABLE public.citas ADD CONSTRAINT citas_no_solapan_por_medico EXCLUDE USING gist (medico_id WITH =, tstzrange(inicio, fin, '[)') WITH &&) WHERE (estado IN ('programada','confirmada'));

ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_disponibilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_bloqueos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE OR REPLACE FUNCTION public.crear_agenda_principal_si_medico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'medico' THEN
    IF NOT EXISTS (SELECT 1 FROM public.agendas a WHERE a.medico_id = NEW.id) THEN
      INSERT INTO public.agendas (medico_id, nombre) VALUES (NEW.id, 'Agenda principal');
    END IF;
  END IF; RETURN NEW;
END; $$;
CREATE TRIGGER tr_crear_agenda_principal_si_medico AFTER INSERT OR UPDATE OF role ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.crear_agenda_principal_si_medico();

CREATE TRIGGER tr_touch_citas BEFORE UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION public.touch_actualizado_en();

-- Policies
CREATE POLICY "Ver sus citas" ON public.citas FOR SELECT USING (public.puede_ver_paciente(paciente_id) OR medico_id = auth.uid());
CREATE POLICY "Medicos gestionan sus agendas" ON public.agendas FOR ALL USING (medico_id = auth.uid() OR public.is_admin());
