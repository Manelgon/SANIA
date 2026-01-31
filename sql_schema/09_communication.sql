-- communication.sql
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensaje text,
  leido boolean DEFAULT false,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receptor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenido text,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plantillas_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  contenido TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('consentimiento', 'receta', 'informe', 'otro')) DEFAULT 'otro',
  version INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facultativo_documentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  facultativo_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  ruta_storage text NOT NULL,
  tipo text CHECK (tipo IN ('autonomo','seguros','contrato','personal','otro')) DEFAULT 'otro',
  creado_en timestamptz DEFAULT now(),
  metadatos jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantillas_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facultativo_documentos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver mis notificaciones" ON public.notificaciones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Ver mis mensajes" ON public.mensajes FOR SELECT USING (auth.uid() = emisor_id OR auth.uid() = receptor_id OR public.is_admin());
CREATE POLICY "Leer plantillas activas" ON public.plantillas_documentos FOR SELECT USING (activo = true);
CREATE POLICY "Facultativo gestiona sus documentos" ON public.facultativo_documentos FOR ALL USING (facultativo_id = auth.uid() OR public.is_admin());
