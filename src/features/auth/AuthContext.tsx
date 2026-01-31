import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import type { UserState, SignInCredentials } from './types';

interface AuthContextType extends UserState {
    login: (credentials: SignInCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UserState>({
        user: null,
        profile: null,
        loading: true,
    });

    const loadUser = async () => {
        try {
            const session = await authService.getCurrentSession();
            if (session?.user) {
                const profile = await authService.getUserProfile(session.user.id);
                setState({ user: session.user, profile, loading: false });
            } else {
                setState({ user: null, profile: null, loading: false });
            }
        } catch (error) {
            console.error('Error loading user:', error);
            setState({ user: null, profile: null, loading: false });
        }
    };

    useEffect(() => {
        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('DEBUG: Auth State Change:', event);
            if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
                // Solo cargar perfil si cambiamos de usuario o es carga inicial
                if (state.user?.id !== session.user.id || !state.profile) {
                    try {
                        const profile = await authService.getUserProfile(session.user.id);
                        setState({ user: session.user, profile, loading: false });
                    } catch (err) {
                        console.error('Error fetching profile in AuthStateChange:', err);
                        // Even if profile fails, we stop loading. User might need redirect or retry.
                        setState({ user: session.user, profile: null, loading: false });
                    }
                } else {
                    // Si ya tenemos usuario y perfil, solo asegurar loading false
                    setState(current => ({ ...current, user: session.user, loading: false }));
                }
            } else if (event === 'SIGNED_OUT') {
                setState({ user: null, profile: null, loading: false });
            } else {
                // Para otros eventos, asegurar que loading se quite si ya terminó la carga inicial
                if (state.loading) {
                    // Si no hay sesión y el evento no es de login, terminar carga
                    if (!session) setState({ user: null, profile: null, loading: false });
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (credentials: SignInCredentials) => {
        await authService.signIn(credentials);
    };

    const logout = async () => {
        await authService.signOut();
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
