import { supabase } from '../lib/supabase';
import type { FacultativoFull, AdminStats, Specialty } from '../features/admin/types';

export const adminService = {
    async getFacultativos(): Promise<FacultativoFull[]> {
        const { data, error } = await supabase
            .from('facultativos_detalle_view')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getSpecialties(): Promise<Specialty[]> {
        const { data, error } = await supabase
            .from('especialidades')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getAdminStats(): Promise<AdminStats> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [facultativos, pacientes, citas] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'medico'),
            supabase.from('pacientes').select('id', { count: 'exact', head: true }),
            supabase.from('citas').select('id', { count: 'exact', head: true }).gte('inicio', today.toISOString())
        ]);

        return {
            totalFacultativos: facultativos.count || 0,
            totalPacientes: pacientes.count || 0,
            citasHoy: citas.count || 0,
            alertasSeguridad: 0 // Placeholder
        };
    },

    async createFacultativo(payload: Partial<FacultativoFull> & { email: string; nombre: string; apellido1: string }) {
        // Nota: La creación de usuario real en Auth desde el cliente requiere 
        // privilegios de administrador que no siempre están habilitados vía JS.
        // Idealmente se llama a un RPC o Edge Function.

        // Asumimos que existe un RPC 'admin_create_doctor'
        const { data, error } = await supabase.rpc('admin_create_doctor', {
            p_email: payload.email,
            p_nombre: payload.nombre,
            p_apellido1: payload.apellido1,
            p_apellido2: payload.apellido2 || null,
            p_especialidad: payload.especialidad || null,
            p_num_colegiado: payload.num_colegiado,
            p_phone: payload.phone || null,
            p_cif: payload.cif || null,
            p_direccion: payload.direccion || null,
            p_bio: payload.bio || null,
            p_especialidad_id: payload.especialidad_id || null
        });

        if (error) throw error;
        return data;
    },

    async uploadFacultativoDocument(facultativoId: string, file: File, nombre: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${facultativoId}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('facultativos-documentos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('facultativos-documentos')
            .getPublicUrl(filePath);

        // 3. Save to database
        const { data, error: dbError } = await supabase
            .from('facultativos_documentos')
            .insert({
                facultativo_id: facultativoId,
                nombre: nombre,
                tipo: file.type,
                url: publicUrl,
                storage_path: filePath
            })
            .select()
            .single();

        if (dbError) throw dbError;
        return data;
    }
};
