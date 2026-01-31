import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Lock, Phone, MapPin, Building, Loader2, CheckCircle2, UserPlus } from 'lucide-react';
import { facultativoService } from '../../../services/facultativoService';

const pacienteSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido'),
    apellido1: z.string().min(2, 'Primer apellido requerido'),
    apellido2: z.string().optional(),
    dni: z.string().min(9, 'DNI requerido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    phone: z.string().optional(),
    direccion: z.string().optional(),
});

type PacienteFormValues = z.infer<typeof pacienteSchema>;

interface CreatePacienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePacienteModal: React.FC<CreatePacienteModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PacienteFormValues>({
        resolver: zodResolver(pacienteSchema),
        defaultValues: {
            nombre: '',
            apellido1: '',
            apellido2: '',
            dni: '',
            email: '',
            password: '',
            phone: '',
            direccion: ''
        }
    });

    const onSubmit = async (data: PacienteFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await facultativoService.createPatient(data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
                reset();
            }, 2000);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'Error al crear paciente';
            setError(errorMessage);
            alert(`Error al guardar: ${errorMessage}`);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={isSubmitting || success ? undefined : onClose}
            ></div>

            <div className="relative z-50 bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {isSubmitting && !success ? (
                    <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-300">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">Registrando paciente...</h4>
                        <p className="text-slate-500 text-sm mt-2">Creando perfil y credenciales de acceso.</p>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center justify-center py-24 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                            <CheckCircle2 size={48} />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Paciente registrado</h4>
                        <p className="text-slate-500">El paciente ya puede acceder a su portal.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Nuevo Paciente</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Alta en Cartera</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit, (errors) => {
                                console.log('Validation errors:', errors);
                                // Show alert for validation errors to ensure user sees them
                                const firstError = Object.values(errors)[0];
                                if (firstError) {
                                    alert(`Error de validación: ${firstError.message}`);
                                }
                            })} className="space-y-6" autoComplete="off">
                                {/* Hidden inputs to trick browser autocomplete */}
                                <input autoComplete="false" name="hidden" type="text" style={{ display: 'none' }} />
                                <input autoComplete="false" name="hidden" type="password" style={{ display: 'none' }} />

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                        <User size={14} className="mr-2" /> Datos Personales
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Nombre</label>
                                            <input {...register('nombre')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Nombre" autoComplete="off" />
                                            {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.nombre.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">DNI / NIE</label>
                                            <div className="relative group">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input {...register('dni')} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="12345678A" autoComplete="off" />
                                            </div>
                                            {errors.dni && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.dni.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Primer Apellido</label>
                                            <input {...register('apellido1')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Apellido 1" autoComplete="off" />
                                            {errors.apellido1 && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.apellido1.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Segundo Apellido</label>
                                            <input {...register('apellido2')} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Apellido 2" autoComplete="off" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                        <Lock size={14} className="mr-2" /> Acceso y Contacto
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Email (Usuario)</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    {...register('email')}
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    placeholder="paciente@email.com"
                                                    autoComplete="new-password" // Hack to prevent autofill
                                                    role="presentation"
                                                />
                                            </div>
                                            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Contraseña</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    {...register('password')}
                                                    type="password"
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Teléfono</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input {...register('phone')} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="600 000 000" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Dirección</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                <input {...register('direccion')} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Domicilio" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl">
                                        <p className="text-xs text-red-600 font-bold text-center">{error}</p>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Registrar Paciente</span>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatePacienteModal;
