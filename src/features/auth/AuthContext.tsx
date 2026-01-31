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
            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await authService.getUserProfile(session.user.id);
                setState({ user: session.user, profile, loading: false });
            } else if (event === 'SIGNED_OUT') {
                setState({ user: null, profile: null, loading: false });
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
