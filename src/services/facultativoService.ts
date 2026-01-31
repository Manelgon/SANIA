import { supabase } from '../lib/supabase';

export interface PatientFull {
    id: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    dni: string;
    telefono_principal?: string;
    creado_en: string;
    // Add other fields as needed
}

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
    },

    async getPatients(medicoId?: string) {
        // En teoría, el RLS filtra solo los pacientes de las carteras del médico.
        // Pero tambien podemos filtrar explicitamente si tenemos múltiples carteras.
        // Por ahora confiamos en RLS.
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('creado_en', { ascending: false });

        if (error) throw error;
        return data as PatientFull[];
    },

    async createPatient(payload: {
        nombre: string;
        apellido1: string;
        apellido2?: string;
        dni: string;
        email: string;
        password?: string;
        telefono?: string;
        direccion?: string;
    }) {
        const { data, error } = await supabase.rpc('facultativo_create_patient', {
            p_nombre: payload.nombre,
            p_apellido1: payload.apellido1,
            p_apellido2: payload.apellido2 || null,
            p_dni: payload.dni,
            p_email: payload.email,
            p_password: payload.password || 'SaniaPaciente123!', // Default password logic
            p_telefono: payload.telefono || null,
            p_direccion: payload.direccion || null
        });

        if (error) throw error;
        return data; // Returns new patient UUID
    }
};
