import { supabase } from '../lib/supabase';

export const facultativoService = {
    async getDoctorStats(medicoId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Queries concurrentes para eficiencia
        const [citasHoy, pacientesNuevosHoy] = await Promise.all([
            supabase
                .from('citas')
                .select('estado')
                .eq('medico_id', medicoId)
                .gte('inicio', today.toISOString())
                .lt('inicio', tomorrow.toISOString()),

            supabase
                .from('pacientes')
                .select('id', { count: 'exact', head: true })
                .gte('creado_en', today.toISOString())
                .lt('creado_en', tomorrow.toISOString())
        ]);

        if (citasHoy.error) throw citasHoy.error;
        if (pacientesNuevosHoy.error) throw pacientesNuevosHoy.error;

        const stats = {
            total: citasHoy.data.length,
            completadas: citasHoy.data.filter(c => c.estado === 'realizada').length,
            pendientes: citasHoy.data.filter(c => c.estado === 'programada' || c.estado === 'confirmada').length,
            nuevosPacientes: pacientesNuevosHoy.count || 0
        };

        return stats;
    }
};
