import React, { useState, useEffect } from 'react';
import { facultativoService, PatientFull } from '../../../services/facultativoService';
import { Search, Plus, User, MoreVertical, Loader2, Calendar, Phone } from 'lucide-react';
import CreatePacienteModal from './CreatePacienteModal';

const PacientesList: React.FC = () => {
    const [patients, setPatients] = useState<PatientFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const data = await facultativoService.getPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.apellido1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.dni.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellidos o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white shadow-sm"
                    />
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Paciente</span>
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <User className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No se encontraron pacientes</h3>
                    <p className="text-slate-500 text-sm">Prueba con otros términos o crea un nuevo paciente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {patient.nombre.charAt(0)}{patient.apellido1.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                            {patient.nombre} {patient.apellido1}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{patient.dni}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                    {patient.telefono_principal || 'Sin teléfono'}
                                </div>
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                    Registrado: {new Date(patient.creado_en).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">
                                    Activo
                                </span>
                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                                    Ver Ficha
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreatePacienteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadPatients}
            />
        </div>
    );
};

export default PacientesList;
