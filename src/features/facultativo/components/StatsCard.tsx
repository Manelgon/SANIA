import React from 'react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    delay?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, colorClass, delay = '0ms' }) => {
    return (
        <div
            className={`p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: delay, animationFillMode: 'both' }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorClass}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div className={`h-full opacity-60 rounded-full ${colorClass.split(' ')[0]}`} style={{ width: '60%' }}></div>
            </div>
        </div>
    );
};

export default StatsCard;
