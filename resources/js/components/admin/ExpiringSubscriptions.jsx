export default function ExpiringSubscriptions({ subscriptions = [] }) {
    return (
        <div className="overflow-x-auto">
            {subscriptions.length > 0 ? (
                <table className="w-full min-w-[820px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Personne
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Plan
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Date d'expiration
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Statut
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Montant
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub, index) => {
                            const isExpired = sub.days_overdue > 0;
                            const daysText = isExpired
                                ? sub.days_overdue === 0
                                    ? 'Aujourd\'hui'
                                    : `${sub.days_overdue} jour${sub.days_overdue > 1 ? 's' : ''} en retard`
                                : 'Expires aujourd\'hui';

                            return (
                                <tr
                                    key={sub.id || index}
                                    className={`border-b border-slate-100 dark:border-slate-700 transition ${
                                        isExpired
                                            ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                                            : 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                    }`}
                                >
                                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                        {sub.user_name}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="font-semibold">{sub.plan_name}</div>
                                        <div className="text-xs text-slate-500">{sub.plan_type}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {sub.user_email}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(sub.end_date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                isExpired
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                            }`}
                                        >
                                            {daysText}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                                        dh {sub.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="text-lg font-semibold mb-2">✅ Parfait!</div>
                    Aucun abonnement expiré ou à expirer aujourd'hui
                </div>
            )}
        </div>
    );
}
