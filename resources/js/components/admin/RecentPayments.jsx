export default function RecentPayments({ payments }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'Payé':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'pending':
            case 'En attente':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
            case 'failed':
            case 'Échoué':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            case 'refunded':
            case 'Remboursé':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            paid: 'Payé',
            pending: 'En attente',
            failed: 'Échoué',
            refunded: 'Remboursé',
        };
        return statusMap[status] || status;
    };

    const displayPayments = payments && payments.length > 0 ? payments : [];

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                            ID Paiement
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Élève
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Date
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Montant
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Statut
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayPayments.map((payment, index) => (
                        <tr
                            key={payment.id || index}
                            className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                        >
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                {payment.id}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                {payment.student}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                                dh {payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-center">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        payment.status
                                    )}`}
                                >
                                    {getStatusLabel(payment.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {displayPayments.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Aucun paiement pour le moment
                </div>
            )}
        </div>
    );
}
