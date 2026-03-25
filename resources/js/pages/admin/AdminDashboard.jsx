import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const { data: res } = await api.get('/admin/dashboard-stats');
                setData(res.data);
            } catch {
                setError('Impossible de charger les statistiques.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <p className="text-slate-500">Chargement...</p>;
    }

    if (error) {
        return <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>;
    }

    const cards = [
        { label: 'Utilisateurs', value: data?.total_users ?? 0 },
        { label: 'Élèves', value: data?.total_students ?? 0 },
        { label: 'Professeurs', value: data?.total_teachers ?? 0 },
        { label: 'Cours', value: data?.total_courses ?? 0 },
        { label: 'Inscriptions (lignes)', value: data?.total_enrollments ?? 0 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
            <p className="text-slate-600 text-sm">Vue simple des effectifs et des cours.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {cards.map(c => (
                    <div key={c.label} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="text-xs text-slate-500 uppercase">{c.label}</div>
                        <div className="text-2xl font-bold text-slate-800 mt-1">{c.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
