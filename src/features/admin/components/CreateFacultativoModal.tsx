import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Lock, Briefcase, Hash, Loader2, CheckCircle2, UserPlus, Phone, MapPin, Building, FileText, Upload, Trash2, File } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { FacultativoFull, Specialty } from '../types';

const facultativoSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombre: z.string().min(2, 'Nombre requerido'),
    apellido1: z.string().min(2, 'Primer apellido requerido'),
    apellido2: z.string().optional(),
    especialidad_id: z.string().uuid('Selecciona una especialidad'),
    num_colegiado: z.string().min(3, 'Número de colegiado requerido'),
    phone: z.string().optional(),
    cif: z.string().optional(),
    direccion: z.string().optional(),
    bio: z.string().optional(),
});

type FacultativoFormValues = z.infer<typeof facultativoSchema>;

interface CreateFacultativoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateFacultativoModal: React.FC<CreateFacultativoModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; label: string }[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);

    useEffect(() => {
        const loadSpecialties = async () => {
            try {
                const data = await adminService.getSpecialties();
                setSpecialties(data);
            } catch (err) {
                console.error('Error loading specialties:', err);
            }
        };
        if (isOpen) {
            loadSpecialties();
        }
    }, [isOpen]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FacultativoFormValues>({
        resolver: zodResolver(facultativoSchema),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                label: file.name.split('.')[0]
            }));
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FacultativoFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // 1. Create Facultative
            const facultativoId = await adminService.createFacultativo(data as any);

            // 2. Upload Documents if any
            if (selectedFiles.length > 0) {
                await Promise.all(selectedFiles.map(item =>
                    adminService.uploadFacultativoDocument(facultativoId, item.file, item.label)
                ));
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
                reset();
                setSelectedFiles([]);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Error al completar el proceso');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Nuevo Facultativo</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Alta y Colegiación</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {success ? (
                        <div className="py-12 text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                <CheckCircle2 size={48} />
                            </div>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Operación Completada!</h4>
                            <p className="text-slate-500">El facultativo y sus documentos han sido procesados.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                    <User size={14} className="mr-2" /> Identificación y Contacto
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Nombre</label>
                                        <input
                                            {...register('nombre')}
                                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.nombre ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white`}
                                            placeholder="Nombre"
                                        />
                                        {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.nombre.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">1º Apellido</label>
                                        <input
                                            {...register('apellido1')}
                                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.apellido1 ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white`}
                                            placeholder="Apellido 1"
                                        />
                                        {errors.apellido1 && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.apellido1.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">2º Apellido</label>
                                        <input
                                            {...register('apellido2')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                                            placeholder="Apellido 2 (Opcional)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Email Corporativo</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                {...register('email')}
                                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white`}
                                                placeholder="doctor@sania.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                {...register('password')}
                                                type="password"
                                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Teléfono Directo</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                {...register('phone')}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                                                placeholder="600 000 000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                    <Briefcase size={14} className="mr-2" /> Información Profesional
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">CIF / DNI Fiscal</label>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                {...register('cif')}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                                                placeholder="Fiscal ID"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Especialidad Sanitaria *</label>
                                        <div className="relative">
                                            <select
                                                {...register('especialidad_id')}
                                                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 ${errors.especialidad_id ? 'border-red-300' : 'border-indigo-100 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white cursor-pointer`}
                                            >
                                                <option value="">-- Seleccionar especialidad --</option>
                                                {specialties.length > 0 ? (
                                                    specialties.map(s => (
                                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                                    ))
                                                ) : (
                                                    <option disabled>Cargando lista...</option>
                                                )}
                                            </select>
                                        </div>
                                        {errors.especialidad_id && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.especialidad_id.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Nº Colegiado</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                {...register('num_colegiado')}
                                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.num_colegiado ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white`}
                                                placeholder="Nº Colegiado"
                                            />
                                        </div>
                                        {errors.num_colegiado && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.num_colegiado.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Dirección Profesional</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            {...register('direccion')}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm text-slate-900 dark:text-white"
                                            placeholder="Calle, Ciudad, Provincia"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Biografía y Resumen Curricular</label>
                                    <textarea
                                        {...register('bio')}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm resize-none text-slate-900 dark:text-white"
                                        placeholder="Describe brevemente la trayectoria profesional..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                    <FileText size={14} className="mr-2" /> Documentación Relacionada
                                </h4>

                                <div className="grid grid-cols-1 gap-4">
                                    <label className="relative flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[24px] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        <span className="mt-2 text-xs font-bold text-slate-500">Haz clic para subir títulos o certificados</span>
                                        <span className="text-[10px] text-slate-400">PDF, JPG o PNG (Máx 5MB)</span>
                                        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedFiles.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                            <File size={16} />
                                                        </div>
                                                        <div>
                                                            <input
                                                                value={item.label}
                                                                onChange={(e) => {
                                                                    const newFiles = [...selectedFiles];
                                                                    newFiles[idx].label = e.target.value;
                                                                    setSelectedFiles(newFiles);
                                                                }}
                                                                className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-slate-700 dark:text-slate-200"
                                                            />
                                                            <p className="text-[10px] text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx)}
                                                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl">
                                    <p className="text-xs text-red-600 font-bold text-center">{error}</p>
                                </div>
                            )}

                            <div className="pt-2 sticky bottom-0 bg-white dark:bg-slate-800 py-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Finalizar y Guardar Facultativo</span>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateFacultativoModal;
