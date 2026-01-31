import { supabase } from '../lib/supabase';
import type { SignInCredentials } from '../features/auth/types';

// Auth service implementation
export const authService = {
    async signIn({ email, password }: SignInCredentials) {
        console.log('DEBUG: Attempting login for:', email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log('DEBUG: Login response:', { data, error });
            if (error) throw error;
            return data;
        } catch (err) {
            console.error('DEBUG: Login threw error:', err);
            throw err;
        }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    }
};
