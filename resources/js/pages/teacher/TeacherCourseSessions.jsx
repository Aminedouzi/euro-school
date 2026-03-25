import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Présent' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Retard' },
    { value: 'excused', label: 'Excusé' },
];

export default function TeacherCourseSessions() {
    const { courseId, sessionId } = useParams();
    const navigate = useNavigate();
    const [courseTitle, setCourseTitle] = useState('');
    const [sessions, setSessions] = useState([]);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [newNotes, setNewNotes] = useState('');

    const loadCourseTitle = useCallback(async () => {
        const { data } = await api.get('/courses');
        const list = data.courses || [];
        const c = list.find((x) => Number(x.id) === Number(courseId));
        setCourseTitle(c?.title || `Cours #${courseId}`);
    }, [courseId]);

    const loadSessions = useCallback(async () => {
        const { data } = await api.get(`/courses/${courseId}/sessions`);
        setSessions(data.sessions || []);
    }, [courseId]);

    const loadSessionDetail = useCallback(async () => {
        if (!sessionId) {
            setSessionDetail(null);
            setStudents([]);
            return;
        }
        const { data } = await api.get(`/courses/${courseId}/sessions/${sessionId}`);
        setSessionDetail(data.session);
        setStudents(
            (data.students || []).map((s) => ({
                ...s,
                status: s.status || 'present',
            }))
        );
    }, [courseId, sessionId]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                await loadCourseTitle();
                if (cancelled) return;
                await loadSessions();
                if (cancelled) return;
                await loadSessionDetail();
            } catch (e) {
                if (!cancelled) {
                    setError(e.response?.data?.message || 'Impossible de charger les séances');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [loadCourseTitle, loadSessions, loadSessionDetail]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(`/courses/${courseId}/sessions`, {
                session_date: newDate,
                notes: newNotes || null,
            });
            setNewNotes('');
            await loadSessions();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.session_date?.[0] || 'Erreur à la création');
        }
    };

    const handleStatusChange = (userId, status) => {
        setStudents((prev) =>
            prev.map((s) => (Number(s.id) === Number(userId) ? { ...s, status } : s))
        );
    };

    const handleSaveAttendance = async () => {
        if (!sessionId) return;
        setSaving(true);
        setError('');
        try {
            await api.put(`/courses/${courseId}/sessions/${sessionId}/attendance`, {
                attendances: students.map((s) => ({ user_id: s.id, status: s.status })),
            });
            await loadSessions();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur à l’enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !courseTitle) {
        return <div className="text-slate-500 dark:text-slate-400">Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <Link
                    to="/teacher/courses"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    ← Mes cours
                </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Présences — {courseTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Créez une séance par date, puis enregistrez la présence de chaque élève inscrit.
            </p>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Nouvelle séance</h2>
                    <form onSubmit={handleCreateSession} className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Date de la séance</label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Notes (optionnel)</label>
                            <textarea
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                        >
                            Créer la séance
                        </button>
                    </form>

                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mt-8 mb-3">Séances</h2>
                    <ul className="space-y-2">
                        {sessions.length === 0 ? (
                            <li className="text-slate-500 dark:text-slate-400 text-sm">Aucune séance pour l’instant.</li>
                        ) : (
                            sessions.map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/teacher/courses/${courseId}/sessions/${s.id}`)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                            Number(sessionId) === Number(s.id)
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {new Date(s.session_date).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        {s.notes ? (
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                                {s.notes}
                                            </span>
                                        ) : null}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div>
                    {sessionId && sessionDetail ? (
                        <>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                                Feuille de présence
                            </h2>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-200">Élève</th>
                                            <th className="px-3 py-2 text-left text-slate-700 dark:text-slate-200">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-3 py-4 text-slate-500">
                                                    Aucun élève inscrit à ce cours.
                                                </td>
                                            </tr>
                                        ) : (
                                            students.map((s) => (
                                                <tr key={s.id}>
                                                    <td className="px-3 py-2 text-slate-800 dark:text-white">
                                                        <div className="font-medium">{s.name}</div>
                                                        <div className="text-xs text-slate-500">{s.email}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={s.status}
                                                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                                                            className="w-full max-w-[160px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                        >
                                                            {STATUS_OPTIONS.map((o) => (
                                                                <option key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {students.length > 0 && (
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={handleSaveAttendance}
                                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                                >
                                    {saving ? 'Enregistrement…' : 'Enregistrer les présences'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400 text-sm p-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl">
                            Sélectionnez une séance à gauche pour saisir les présences.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
