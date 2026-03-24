import { useState, useEffect } from 'react';
import api from '../../api';

export default function StudentsList() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        birth_date: '',
        inscription_date: new Date().toISOString().split('T')[0],
        school_id: '',
        course_ids: [],
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
        fetchSchools();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/users');
            setStudents(data.filter(u => u.role === 'student'));
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des élèves');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            const normalizedCourses = Array.isArray(data)
                ? data
                : Array.isArray(data?.courses)
                    ? data.courses
                    : [];
            setCourses(normalizedCourses);
        } catch {
            setCourses([]);
        }
    };

    const fetchSchools = async () => {
        try {
            const { data } = await api.get('/schools');
            setSchools(data.schools || []);
        } catch {
            setSchools([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCourseToggle = (courseId) => {
        setFormData(prev => {
            const ids = prev.course_ids || [];
            const idx = ids.findIndex(id => Number(id) === Number(courseId));
            if (idx === -1) {
                return { ...prev, course_ids: [...ids, courseId] };
            }
            return { ...prev, course_ids: ids.filter((_, i) => i !== idx) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = { ...formData, role: 'student' };
            if (!payload.password) delete payload.password;
            if (!payload.birth_date) payload.birth_date = null;
            if (!payload.inscription_date) payload.inscription_date = null;
            if (!payload.school_id) payload.school_id = null;
            if (!payload.course_ids || payload.course_ids.length === 0) {
                payload.course_ids = [];
            }

            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
                setEditingId(null);
            } else {
                if (!formData.password) {
                    setError('Le mot de passe est requis');
                    return;
                }
                await api.post('/users', payload);
            }
            resetForm();
            await fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            email: student.email,
            password: '',
            phone: student.phone || '',
            birth_date: student.birth_date || '',
            inscription_date: student.inscription_date || '',
            school_id: student.school_id || '',
            course_ids: student.course_ids || [],
        });
        setEditingId(student.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) return;
        try {
            setError('');
            await api.delete(`/users/${id}`);
            await fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            birth_date: '',
            inscription_date: new Date().toISOString().split('T')[0],
            school_id: '',
            course_ids: [],
        });
        setShowForm(false);
        setEditingId(null);
    };

    const schoolName = (id) => schools.find(s => Number(s.id) === Number(id))?.name || (id ? `École #${id}` : '—');

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white";
    const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Élèves</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        + Nouvel Élève
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {editingId ? "Modifier l'élève" : 'Ajouter un nouvel élève'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Nom complet *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Téléphone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Mot de passe {!editingId && '*'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingId}
                                    placeholder={editingId ? 'Laisser vide pour ne pas modifier' : ''}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Date de naissance</label>
                                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Date d'inscription</label>
                                <input type="date" name="inscription_date" value={formData.inscription_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>École</label>
                                <select name="school_id" value={formData.school_id} onChange={handleInputChange} className={inputCls}>
                                    <option value="">— Sélectionner —</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Cours (plusieurs possibles)</label>
                            <div className="space-y-2 border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700 max-h-48 overflow-y-auto">
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <label key={course.id} className="flex items-center cursor-pointer gap-2">
                                            <input
                                                type="checkbox"
                                                checked={(formData.course_ids || []).some(id => Number(id) === Number(course.id))}
                                                onChange={() => handleCourseToggle(course.id)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-slate-900 dark:text-white text-sm">
                                                {course.title}
                                                {course.school?.name ? (
                                                    <span className="text-slate-500 dark:text-slate-400"> — {course.school.name}</span>
                                                ) : null}
                                            </span>
                                        </label>
                                    ))
                                ) : (
                                    <div className="text-slate-500 dark:text-slate-400 text-sm">Aucun cours disponible</div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                Annuler
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                                {editingId ? 'Modifier' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {students.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">ID Élève</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nom</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Téléphone</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Naissance</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Inscription</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">École</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Cours</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {students.map(student => {
                                const names = (student.course_ids || [])
                                    .map(cid => courses.find(c => Number(c.id) === Number(cid))?.title)
                                    .filter(Boolean)
                                    .join(', ');
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {student.student_uid || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{student.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.email}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.phone || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                            {student.inscription_date ? new Date(student.inscription_date).toLocaleDateString('fr-FR') : new Date(student.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {schoolName(student.school_id)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] text-xs">
                                            {names || '—'}
                                        </td>
                                        <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-700 font-medium transition">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-700 font-medium transition">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Aucun élève trouvé
                </div>
            )}
        </div>
    );
}
