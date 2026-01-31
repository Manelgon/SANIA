import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { facultativoService } from '../../services/facultativoService';
import { citasService } from '../../services/citasService';
import {
    Activity,
    Calendar,
    History,
    PlusCircle,
    Users,
    CheckCircle,
    Clock,
    LogOut,
    ChevronRight,
    User,
    LayoutDashboard
} from 'lucide-react';
import PacientesList from './components/PacientesList';

const FacultativoDashboard: React.FC = () => {
    const { profile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('resumen');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, completadas: 0, pendientes: 0, nuevosPacientes: 0 });
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!profile?.id) return;
            try {
                setLoading(true);
                const [dashboardStats, todaysAppointments] = await Promise.all([
                    facultativoService.getDoctorStats(profile.id),
                    citasService.getTodaysAppointments(profile.id)
                ]);
                setStats(dashboardStats);
                setAppointments(todaysAppointments);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profile?.id]);

    const tabs = [
        { id: 'resumen', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'consulta', label: 'Nueva Consulta', icon: <PlusCircle className="w-5 h-5" /> },
        { id: 'pacientes', label: 'Pacientes', icon: <Users className="w-5 h-5" /> },
        { id: 'historial', label: 'Historial', icon: <History className="w-5 h-5" /> },
    ];

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            {/* Premium Header */}
            <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 transition-transform group-hover:scale-105">
                                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Dr." className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-emerald-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></div>
                            </div>

                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                    Hola, Dr. {profile?.full_name?.split(' ')[0] || 'Facultativo'}
                                </h1>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        {profile?.fid || 'FID-NEW'}
                                    </span>
                                    <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                    <div className="flex items-center space-x-2">
                                        <span className="flex items-center text-[10px] font-bold text-success-600 dark:text-success-400">
                                            <CheckCircle className="w-3 h-3 mr-1" /> {stats.completadas}
                                        </span>
                                        <span className="flex items-center text-[10px] font-bold text-primary-600 dark:text-primary-400">
                                            <Clock className="w-3 h-3 mr-1" /> {stats.pendientes}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => logout()}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Clean Navigation Tabs */}
                    <nav className="flex space-x-8 mt-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-4 flex items-center space-x-2 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500 rounded-full animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300"></div>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Sección INICIO - Dashboard Overview */}
                {activeTab === 'resumen' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Activity className="text-primary-500" /> Resumen de Hoy
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        {/* Tarjetas de Estadísticas (KPIs) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {/* Ejemplo de tarjeta azul */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Total</span>
                                </div>
                                <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{stats.total}</div>
                                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Citas programadas</div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Completadas</span>
                                </div>
                                <div className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{stats.completadas}</div>
                                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Visitas realizadas</div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="text-amber-600 dark:text-amber-400" size={24} />
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">Pendientes</span>
                                </div>
                                <div className="text-3xl font-black text-amber-900 dark:text-amber-100">{stats.pendientes}</div>
                                <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">Por atender</div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">Nuevos</span>
                                </div>
                                <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100">{stats.nuevosPacientes}</div>
                                <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Altas recientes</div>
                            </div>
                        </div>
                        {/* Lista de Próximas Citas */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock className="text-primary-500" size={20} />
                                Agenda de Hoy
                            </h3>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : appointments.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No hay citas programadas para hoy</p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer group ${apt.estado === 'realizada' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60' : 'bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-900/50 hover:border-primary-300'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`text-center min-w-[60px] ${apt.estado === 'realizada' ? 'text-slate-400' : 'text-primary-600 dark:text-primary-400'}`}>
                                                    <div className="text-lg font-bold">{formatTime(apt.inicio)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {apt.paciente?.full_name || 'Paciente desconocido'}
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400">{apt.motivo || 'Consulta general'}</div>
                                                </div>
                                            </div>
                                            {/* ... etiquetas de estado ... */}
                                            <div className="flex items-center">
                                                {apt.estado === 'realizada' ? (
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-bold rounded">Realizada</span>
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sección CONSULTA - Formulario Nueva Consulta */}
                {activeTab === 'consulta' && (
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300 mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                                <PlusCircle className="text-primary-500" /> Nueva Consulta
                            </h2>
                            <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="space-y-6">
                            {/* Campo Motivo */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2 ml-1">Motivo de la visita</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white min-h-[100px]"
                                    placeholder="Describa el motivo de la consulta..."
                                ></textarea>
                            </div>
                            {/* Campo Notas Clínicas */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2 ml-1">Notas Clínicas</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white min-h-[200px]"
                                    placeholder="Introduzca observaciones y evolución clínica..."
                                ></textarea>
                            </div>
                            {/* Botonera de Acción */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">Cancelar</button>
                                <button className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none font-bold">Guardar Consulta</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pacientes' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Users className="text-indigo-500" /> Gestión de Pacientes
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Busca, visualiza y da de alta nuevos pacientes en tu cartera.</p>
                        </div>
                        <PacientesList />
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 text-center py-20">
                        <History className="w-16 h-16 mx-auto text-slate-300 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Historial de Consultas</h2>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">Módulo en desarrollo. Visualiza todas tus interacciones previas con pacientes.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FacultativoDashboard;
