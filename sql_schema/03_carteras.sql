-- carteras.sql
CREATE TABLE IF NOT EXISTS public.carteras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL DEFAULT 'Cartera principal',
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.carteras_acceso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cartera_id uuid NOT NULL REFERENCES public.carteras(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permiso text NOT NULL CHECK (permiso IN ('leer', 'escribir', 'admin')),
  creado_en timestamptz DEFAULT now(),
  UNIQUE(cartera_id, medico_id)
);

CREATE TABLE IF NOT EXISTS public.carteras_invitaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cartera_id uuid NOT NULL REFERENCES public.carteras(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aceptada','rechazada')),
  creado_en timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.carteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteras_acceso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteras_invitaciones ENABLE ROW LEVEL SECURITY;

-- Carteras Policies
CREATE POLICY "Dueños ven carteras" ON public.carteras FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Medicos con acceso ven carteras" ON public.carteras FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.carteras_acceso ca WHERE ca.cartera_id = public.carteras.id AND ca.medico_id = auth.uid()));

-- Invitaciones Policies
CREATE POLICY "Ver mis invitaciones" ON public.carteras_invitaciones FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR public.is_admin());

CREATE POLICY "Gestionar mis invitaciones" ON public.carteras_invitaciones FOR UPDATE 
USING (auth.uid() = recipient_id OR public.is_admin());

-- Indices
CREATE INDEX IF NOT EXISTS idx_carteras_owner ON public.carteras(owner_id);
CREATE INDEX IF NOT EXISTS idx_carteras_acceso_medico ON public.carteras_acceso(medico_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_carteras_acceso ON public.carteras_acceso(cartera_id, medico_id);
