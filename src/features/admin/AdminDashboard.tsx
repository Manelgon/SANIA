import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { adminService } from '../../services/adminService';
import {
    Users,
    ShieldCheck,
    Search,
    Plus,
    Settings,
    Activity,
    LogOut,
    UserPlus,
    ArrowUpRight,
    TrendingUp,
    Shield,
    Briefcase
} from 'lucide-react';
import StatsCard from '../facultativo/components/StatsCard';
import CreateFacultativoModal from './components/CreateFacultativoModal';

const AdminDashboard: React.FC = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('facultativos');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalFacultativos: 0, totalPacientes: 0, citasHoy: 0, alertasSeguridad: 0 });
    const [facultativos, setFacultativos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [adminStats, facultativosList] = await Promise.all([
                adminService.getAdminStats(),
                adminService.getFacultativos()
            ]);
            setStats(adminStats);
            setFacultativos(facultativosList);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredFacultativos = facultativos.filter(f =>
        f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'facultativos', label: 'Facultativos', icon: <Users className="w-5 h-5" /> },
        { id: 'vigilancia', label: 'Vigilancia', icon: <Shield className="w-5 h-5" /> },
        { id: 'carteras', label: 'Carteras', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'ajustes', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            {/* Admin Premium Header */}
            <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-indigo-100 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Admin <span className="text-indigo-600">SanIA</span></h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel de Control Central</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex space-x-2">
                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center">
                                    <Activity className="w-3 h-3 mr-1" /> Sistema Online
                                </span>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <nav className="flex space-x-8 mt-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-4 flex items-center space-x-2 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300"></div>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatsCard
                        label="Facultativos"
                        value={stats.totalFacultativos}
                        icon={<UserPlus className="w-7 h-7 text-indigo-600" />}
                        colorClass="bg-indigo-50 dark:bg-indigo-900/30"
                    />
                    <StatsCard
                        label="Pacientes Totales"
                        value={stats.totalPacientes}
                        icon={<Users className="w-7 h-7 text-emerald-600" />}
                        colorClass="bg-emerald-50 dark:bg-emerald-900/30"
                        delay="100ms"
                    />
                    <StatsCard
                        label="Citas Hoy"
                        value={stats.citasHoy}
                        icon={<TrendingUp className="w-7 h-7 text-amber-600" />}
                        colorClass="bg-amber-50 dark:bg-amber-900/30"
                        delay="200ms"
                    />
                    <StatsCard
                        label="Seguridad"
                        value="OK"
                        icon={<ShieldCheck className="w-7 h-7 text-rose-600" />}
                        colorClass="bg-rose-50 dark:bg-rose-900/30"
                        delay="300ms"
                    />
                </div>

                {activeTab === 'facultativos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Gestión de Facultativos</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Administra el personal médico y sus permisos de acceso.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Añadir Facultativo</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o especialidad..."
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Facultativo</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Especialidad</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">FID / Colegiado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={5} className="px-6 py-10"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : filteredFacultativos.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">No se encontraron facultativos.</td>
                                            </tr>
                                        ) : filteredFacultativos.map((fac) => (
                                            <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                                                            {fac.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{fac.full_name}</p>
                                                            <p className="text-xs text-slate-500">{fac.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">
                                                        {fac.especialidad || 'No definida'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fac.fid || 'N/A'}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{fac.num_colegiado || 'S/N'}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center text-success-600 text-xs font-bold">
                                                        <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                                                        Activo
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vigilancia' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 bg-white dark:bg-slate-800 p-12 rounded-[32px] border border-slate-100 dark:border-slate-700 text-center">
                        <Shield className="w-16 h-16 mx-auto text-slate-300 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registros de Auditoría y Seguridad</h2>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">Próximamente. Control de accesos RGPD y logs de actividad del sistema.</p>
                    </div>
                )}

                {/* Other tabs placeholders... */}
            </main>

            <CreateFacultativoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default AdminDashboard;
