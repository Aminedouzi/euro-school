import { useState, useEffect } from 'react';
import api from '../../api';
import ThemeToggle from '../../components/ThemeToggle';
import KPICard from '../../components/admin/KPICard';
import RevenueChart from '../../components/admin/RevenueChart';
import StudentDistributionChart from '../../components/admin/StudentDistributionChart';
import RecentPayments from '../../components/admin/RecentPayments';
import ExpiringSubscriptions from '../../components/admin/ExpiringSubscriptions';
import TeachersToPay from '../../components/admin/TeachersToPay';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/admin/dashboard-stats');
                setData(data.data);
            } catch (err) {
                setError('Erreur lors du chargement des données');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handlePrintSection = (sectionId, title) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        const now = new Date().toLocaleString('fr-FR');
        printWindow.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
                    h1 { font-size: 22px; margin: 0 0 6px 0; }
                    .meta { color: #6b7280; margin-bottom: 20px; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
                    th { background: #f8fafc; text-align: left; }
                    td { vertical-align: top; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="meta">Imprimé le ${now}</div>
                ${section.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500">Chargement du tableau de bord...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                    Tableau de bord Administrateur
                </h1>
                <ThemeToggle minimal={true} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Élèves inscrits"
                    value={data?.total_students || 0}
                    icon="👥"
                    trend={data?.student_growth}
                />
                <KPICard
                    title="Abonnements Actifs"
                    value={data?.active_subscriptions || 0}
                    icon="📄"
                    trend={data?.subscription_growth}
                />
                <KPICard
                    title="Revenu Mensuel"
                    value={` DH ${(data?.monthly_revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
                    icon="💰"
                    trend={data?.revenue_growth}
                />
                <KPICard
                    title="Paiements en attente"
                    value={`DH ${(data?.pending_payments || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
                    icon="⚠️"
                    trend={null}
                    warning={true}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        Évolution du Revenu Mensuel
                    </h2>
                    <RevenueChart data={data?.monthly_revenue_data || []} />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        Répartition des Élèves par Groupe
                    </h2>
                    <StudentDistributionChart data={data?.student_distribution || []} />
                </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Paiements Récents
                    </h2>
                    <button
                        type="button"
                        onClick={() => handlePrintSection('recent-payments-print', 'Paiements récents')}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    >
                        Imprimer
                    </button>
                </div>
                <div id="recent-payments-print">
                    <RecentPayments payments={data?.recent_payments || []} />
                </div>
            </div>

            {/* Élevès à payer (abonnements) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Élèves à payer aujourd&apos;hui
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Abonnements qui expirent aujourd&apos;hui.
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                            {data?.students_due_today?.length || 0}
                        </span>
                    </div>
                    <div className="mb-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handlePrintSection('students-due-today-print', 'Élèves à payer aujourd\'hui')}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                            Imprimer
                        </button>
                    </div>
                    <div id="students-due-today-print">
                        <ExpiringSubscriptions subscriptions={data?.students_due_today || []} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Élèves en retard de paiement
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Abonnements expirés avant aujourd&apos;hui.
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                            {data?.students_overdue?.length || 0}
                        </span>
                    </div>
                    <div className="mb-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handlePrintSection('students-overdue-print', 'Élèves en retard de paiement')}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                            Imprimer
                        </button>
                    </div>
                    <div id="students-overdue-print">
                        <ExpiringSubscriptions subscriptions={data?.students_overdue || []} />
                    </div>
                </div>
            </div>

            {/* Professeurs à payer */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Professeurs à payer aujourd&apos;hui
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Somme des paiements complétés aujourd&apos;hui par cours (sans suivi de versement).
                        </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                        {data?.teachers_due_today?.length || 0}
                    </span>
                </div>
                <div className="mb-3 flex justify-end">
                    <button
                        type="button"
                        onClick={() => handlePrintSection('teachers-due-today-print', 'Professeurs à payer aujourd\'hui')}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    >
                        Imprimer
                    </button>
                </div>
                <div id="teachers-due-today-print">
                    <TeachersToPay teachers={data?.teachers_due_today || []} />
                </div>
            </div>
        </div>
    );
}
