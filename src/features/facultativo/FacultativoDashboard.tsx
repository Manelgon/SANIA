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
import StatsCard from './components/StatsCard';
import AgendaList from './components/AgendaList';

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
                {activeTab === 'resumen' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatsCard
                                label="Total Citas"
                                value={stats.total}
                                icon={<Calendar className="w-7 h-7 text-primary-600" />}
                                colorClass="bg-primary-50 dark:bg-primary-900/30"
                                delay="0ms"
                            />
                            <StatsCard
                                label="Completadas"
                                value={stats.completadas}
                                icon={<CheckCircle className="w-7 h-7 text-success-600" />}
                                colorClass="bg-success-50 dark:bg-success-900/30"
                                delay="100ms"
                            />
                            <StatsCard
                                label="Pendientes"
                                value={stats.pendientes}
                                icon={<Clock className="w-7 h-7 text-amber-600" />}
                                colorClass="bg-amber-50 dark:bg-amber-900/30"
                                delay="200ms"
                            />
                            <StatsCard
                                label="Nuevos Pacientes"
                                value={stats.nuevosPacientes}
                                icon={<Users className="w-7 h-7 text-indigo-600" />}
                                colorClass="bg-indigo-50 dark:bg-indigo-900/30"
                                delay="300ms"
                            />
                        </div>

                        {/* Visual Agenda */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center">
                                        <Activity className="w-6 h-6 mr-2 text-primary-500" /> Agenda de Hoy
                                    </h3>
                                    <button className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center group">
                                        Ver calendario completo <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <AgendaList appointments={appointments} />
                                )}
                            </div>

                            {/* Quick Actions / Info */}
                            <div className="space-y-6">
                                <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl text-white shadow-xl shadow-primary-500/20">
                                    <h4 className="text-xl font-bold mb-4">Atención Rápida</h4>
                                    <p className="text-primary-100 text-sm mb-6 leading-relaxed">
                                        Recuerda completar el historial clínico de cada paciente al finalizar la consulta para mantener el cumplimiento RGPD.
                                    </p>
                                    <button className="w-full py-3 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-colors flex items-center justify-center">
                                        <PlusCircle className="w-5 h-5 mr-2" />Nueva Entrada
                                    </button>
                                </div>

                                <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-4">Próximo Turno</h4>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Siguiente Paciente</p>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">Cargando...</p>
                                                <p className="text-xs text-slate-500">Consulta Programada</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'consulta' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Nueva Consulta Clínica</h2>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative">
                            {/* Design background flair */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16"></div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Notas Clínicas</label>
                                    <textarea
                                        rows={12}
                                        className="w-full p-6 bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700 rounded-3xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-200 resize-none"
                                        placeholder="Escribe aquí las observaciones médicas, anamnesis y exploración..."
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <button className="px-8 py-4 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300">Descartar</button>
                                    <button className="px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all hover:scale-[1.02]">
                                        Guardar Consulta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pacientes' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 text-center py-20">
                        <Users className="w-16 h-16 mx-auto text-slate-300 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Panel de Pacientes</h2>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">Módulo en desarrollo. Aquí podrás ver el listado completo de pacientes asignados a tus carteras.</p>
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
