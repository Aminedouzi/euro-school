import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function CourseCatalog() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const enrolledIds = (user?.enrolled_courses || []).map((c) => c.id);

    useEffect(() => {
        api.get('/courses')
            .then(({ data }) => setCourses(data.courses || []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    const enroll = (courseId) => {
        setEnrolling(courseId);
        api.post(`/courses/${courseId}/enroll`)
            .then(() => {
                setCourses((prev) =>
                    prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c))
                );
            })
            .catch(() => {})
            .finally(() => setEnrolling(null));
    };

    if (loading) return <div className="text-slate-500">Chargement...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Catalogue des cours</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.length === 0 ? (
                    <p className="text-slate-500">Aucun cours disponible.</p>
                ) : (
                    courses.map((c) => (
                        <div key={c.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-medium text-slate-800 dark:text-white">{c.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{c.type}</p>
                            <p className="text-xs text-slate-500 mt-1">{c.teacher?.name}</p>
                            <button
                                onClick={() => enroll(c.id)}
                                disabled={enrolling === c.id || c.enrolled || enrolledIds.includes(c.id)}
                                className="mt-3 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {(c.enrolled || enrolledIds.includes(c.id)) ? 'Inscrit' : enrolling === c.id ? 'Inscription...' : "S'inscrire"}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
