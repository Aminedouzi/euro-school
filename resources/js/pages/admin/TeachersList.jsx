import { useState, useEffect } from 'react';
import api from '../../api';

export default function TeachersList() {
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        course_ids: [],
    });

    useEffect(() => {
        fetchTeachers();
        fetchCourses();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/users');
            setTeachers(data.filter(u => u.role === 'teacher'));
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des professeurs');
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
            } else {
                return { ...prev, course_ids: ids.filter((_, i) => i !== idx) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                ...formData,
                role: 'teacher',
            };
            if (!payload.password) delete payload.password;
            if (!payload.hire_date) payload.hire_date = null;
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
            await fetchTeachers();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (teacher) => {
        setFormData({
            name: teacher.name,
            email: teacher.email,
            password: '',
            phone: teacher.phone || '',

            hire_date: teacher.hire_date || '',
            course_ids: teacher.course_ids || [],
        });
        setEditingId(teacher.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) return;
        try {
            setError('');
            await api.delete(`/users/${id}`);
            await fetchTeachers();
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
            hire_date: new Date().toISOString().split('T')[0],
            course_ids: [],
        });
        setShowForm(false);
        setEditingId(null);
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white";
    const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Professeurs</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        + Nouveau Professeur
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* FORM */}
            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {editingId ? "Modifier le professeur" : 'Ajouter un nouveau professeur'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Name */}
                            <div>
                                <label className={labelCls}>Nom complet *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputCls} />
                            </div>

                            {/* Email */}
                            <div>
                                <label className={labelCls}>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputCls} />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={labelCls}>Téléphone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputCls} />
                            </div>

                            {/* Password */}
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

                            {/* Hire date */}
                            <div>
                                <label className={labelCls}>Date d'embauche</label>
                                <input type="date" name="hire_date" value={formData.hire_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                        </div>

                        {/* Courses */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Cours à enseigner</label>
                            <div className="space-y-2 border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700">
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <label key={course.id} className="flex items-center cursor-pointer gap-2">
                                            <input
                                                type="checkbox"
                                                checked={(formData.course_ids || []).findIndex(id => Number(id) === Number(course.id)) !== -1}
                                                onChange={() => handleCourseToggle(course.id)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-slate-900 dark:text-white">
                                                {course.title}
                                                {course.school?.name ? (
                                                    <span className="text-slate-500 dark:text-slate-400 text-sm"> — {course.school.name}</span>
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

            {/* TABLE */}
            {teachers.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">ID Professeur</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nom</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Téléphone</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Embauche</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Cours enseignés</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {teachers.map(teacher => {
                                const teacherCourses = (teacher.course_ids || [])
                                    .map(id => courses.find(c => Number(c.id) === Number(id))?.title)
                                    .filter(Boolean)
                                    .join(', ');
                                return (
                                    <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {teacher.teacher_uid || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{teacher.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{teacher.email}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{teacher.phone || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                            {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                                            {teacherCourses || 'Aucun cours'}
                                        </td>
                                        <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEdit(teacher)}
                                                className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(teacher.id)}
                                                className="px-3 py-1 rounded font-medium transition outline-none text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                                            >
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
                    Aucun professeur trouvé
                </div>
            )}
        </div>
    );
}
