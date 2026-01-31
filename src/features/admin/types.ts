export interface Specialty {
    id: string;
    nombre: string;
}

export interface FacultativoFull {
    id: string;
    profile_id: string;
    nombre: string;
    apellido1: string;
    apellido2: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    fid: string | null;
    especialidad: string | null;
    especialidad_id: string | null;
    num_colegiado: string | null;
    cif: string | null;
    direccion: string | null;
    bio: string | null;
    creado_en: string;
}

export interface FacultativoDocumento {
    id: string;
    facultativo_id: string;
    nombre: string;
    tipo: string | null;
    url: string;
    storage_path: string | null;
    creado_en: string;
}

export interface AdminStats {
    totalFacultativos: number;
    totalPacientes: number;
    citasHoy: number;
    alertasSeguridad: number;
}
