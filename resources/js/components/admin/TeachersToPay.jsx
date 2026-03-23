export default function TeachersToPay({ teachers = [] }) {
    return (
        <div className="overflow-x-auto">
            {teachers.length > 0 ? (
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Professeur
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Paiements
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Montant à payer
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t, index) => (
                            <tr
                                key={t.teacher_id ?? index}
                                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                            >
                                <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                    {t.teacher_name}
                                </td>
                                <td className="px-3 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                    {t.teacher_email}
                                </td>
                                <td className="px-3 sm:px-6 py-4 text-sm text-center text-slate-700 dark:text-slate-300 font-medium">
                                    {t.payments_count}
                                </td>
                                <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                    DH {Number(t.amount_total || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="text-lg font-semibold mb-2">✅ Rien à payer aujourd'hui</div>
                    Aucun paiement complété aujourd&apos;hui n&apos;est associé à un cours avec professeur.
                </div>
            )}
        </div>
    );
}

