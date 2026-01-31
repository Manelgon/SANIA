import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { signInSchema, type SignInCredentials } from './types';
import { useAuth } from './AuthContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInCredentials>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInCredentials) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await login(data);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-success-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
                            <LogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">SanIA</h1>
                        <p className="text-slate-500 dark:text-slate-400">Accede a tu panel sanitario inteligente</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className={`w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    id="email"
                                    placeholder="ejemplo@sania.com"
                                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-xl outline-none transition-all duration-200 ${errors.email
                                        ? 'border-red-300 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className={`w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                </div>
                                <input
                                    {...register('password')}
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-xl outline-none transition-all duration-200 ${errors.password
                                        ? 'border-red-300 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20'
                                        }`}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.password.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-primary-500/20"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            ¿Problemas para acceder? Contacta con el administrador.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
