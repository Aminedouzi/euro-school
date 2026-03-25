import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';

export default function StudentAbsences() {
    const { studentId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [student, setStudent] = useState(null);
    const [missed, setMissed] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const { data } = await api.get(`/admin/students/${studentId}/absences`);
                if (cancelled) return;
                setStudent(data.student);
                setMissed(data.missed_sessions || []);
            } catch (e) {
                if (!cancelled) {
                    setError(e.response?.data?.message || 'Impossible de charger les absences');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [studentId]);

    if (loading) {
        return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;
    }

    return (
        <div>
            <Link
                to="/admin/students"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
            >
                ← Élèves
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Absences</h1>
            {student && (
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    <span className="font-medium text-slate-800 dark:text-white">{student.name}</span>
                    {' · '}
                    {student.email}
                </p>
            )}

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Cours</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Notes séance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                        {missed.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Aucune absence enregistrée pour cet élève.
                                </td>
                            </tr>
                        ) : (
                            missed.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 text-slate-800 dark:text-white whitespace-nowrap">
                                        {row.session_date
                                            ? new Date(row.session_date).toLocaleDateString('fr-FR', {
                                                  weekday: 'short',
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                              })
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-800 dark:text-white">{row.course_title || '—'}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                        {row.session_notes || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
