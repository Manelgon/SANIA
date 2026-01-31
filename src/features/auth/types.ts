import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type SignInCredentials = z.infer<typeof signInSchema>;

export interface Profile {
    id: string;
    role: 'admin' | 'medico' | 'paciente';
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    fid: string | null;
    creado_en: string;
    actualizado_en: string;
}

export interface UserState {
    user: any | null;
    profile: Profile | null;
    loading: boolean;
}
