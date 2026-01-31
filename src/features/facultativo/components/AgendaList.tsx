import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, User, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

interface AgendaListProps {
    appointments: any[];
    onCitaClick?: (cita: any) => void;
}

const AgendaList: React.FC<AgendaListProps> = ({ appointments, onCitaClick }) => {
    if (appointments.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No hay citas programadas para hoy.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {appointments.map((cita, index) => {
                const isRealizada = cita.estado === 'realizada';
                const hora = format(new Date(cita.inicio), 'HH:mm');
                const nombrePaciente = `${cita.pacientes?.nombre} ${cita.pacientes?.apellido1}`;

                return (
                    <div
                        key={cita.id}
                        onClick={() => onCitaClick?.(cita)}
                        className={`flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 cursor-pointer group animate-in fade-in slide-in-from-right-4 ${isRealizada
                                ? 'opacity-60 border-slate-100 dark:border-slate-800'
                                : 'border-slate-100 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg'
                            }`}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                        <div className={`w-16 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700 mr-4 ${isRealizada ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            <span className="text-lg font-black">{hora}</span>
                            <Clock className="w-3 h-3 mt-1 opacity-50" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h4 className={`font-bold transition-colors ${isRealizada ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white group-hover:text-primary-600'}`}>
                                    {nombrePaciente}
                                </h4>
                                {isRealizada ? (
                                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-primary-400 animate-pulse" />
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                                <span className="truncate max-w-[200px]">{cita.motivo || 'Consulta general'}</span>
                            </p>
                        </div>

                        <div className={`p-2 rounded-xl transition-colors ${isRealizada ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-600 group-hover:text-white'}`}>
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgendaList;
