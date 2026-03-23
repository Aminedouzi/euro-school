import { useState, useEffect } from 'react';
import api from '../../api';

export default function SecretaryCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/courses')
            .then(({ data }) => setCourses(data.courses || []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-slate-500">Chargement...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Cours & inscriptions</h1>
            <div className="grid gap-4 md:grid-cols-2">
                {courses.length === 0 ? (
                    <p className="text-slate-500">Aucun cours.</p>
                ) : (
                    courses.map((c) => (
                        <div key={c.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-medium text-slate-800 dark:text-white">{c.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{c.type} • {c.teacher?.name ?? 'Sans professeur'}</p>
                            <p className="text-xs text-slate-500 mt-1">{c.students?.length ?? 0} élève(s)</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
