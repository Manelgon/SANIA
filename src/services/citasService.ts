import { supabase } from '../lib/supabase';

export const citasService = {
    async getTodaysAppointments(medicoId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        pacientes (
          id,
          nombre,
          apellido1,
          apellido2
        )
      `)
            .eq('medico_id', medicoId)
            .gte('inicio', today.toISOString())
            .lt('inicio', tomorrow.toISOString())
            .order('inicio', { ascending: true });

        if (error) throw error;
        return data;
    },

    async updateCitaStatus(citaId: string, estado: 'programada' | 'confirmada' | 'realizada' | 'cancelada') {
        const { data, error } = await supabase
            .from('citas')
            .update({ estado, actualizado_en: new Date().toISOString() })
            .eq('id', citaId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
