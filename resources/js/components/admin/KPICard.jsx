export default function KPICard({ title, value, icon, trend, warning = false }) {
    return (
        <div className={`rounded-xl p-6 shadow-lg border ${
            warning
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${
                        warning
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-slate-600 dark:text-slate-400'
                    }`}>
                        {title}
                    </p>
                    <h3 className={`text-2xl font-bold mt-2 ${
                        warning
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-slate-800 dark:text-white'
                    }`}>
                        {value}
                    </h3>
                </div>
                <div className="text-3xl">{icon}</div>
            </div>

            {trend && (
                <div className={`mt-3 pt-3 border-t ${
                    warning
                        ? 'border-orange-200 dark:border-orange-800'
                        : 'border-slate-200 dark:border-slate-700'
                }`}>
                    <div className={`text-sm font-medium flex items-center ${
                        trend > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        <span>{trend > 0 ? '↑' : '↓'}</span>
                        <span className="ml-1">{Math.abs(trend)}% ce mois</span>
                    </div>
                </div>
            )}
        </div>
    );
}
