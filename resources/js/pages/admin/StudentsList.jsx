import { useState, useEffect } from 'react';
import api from '../../api';

const SCHOOLS = Array.from({ length: 13 }, (_, i) => i + 1);

export default function StudentsList() {
    const [students, setStudents] = useState([]);
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
        birth_date: '',
        inscription_date: new Date().toISOString().split('T')[0],
        school_id: '',
        course_id: '',
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            if (!payload.course_id) payload.course_id = null;

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
            course_id: student.course_id || '',
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
            course_id: '',
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

            {/* FORM */}
            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {editingId ? "Modifier l'élève" : 'Ajouter un nouvel élève'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Name */}
                            <div>
                                <label className={labelCls}>Nom complet *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputCls} />
                            </div>

                            {/* Unique student ID */}
                            <div>
                                <label className={labelCls}>Identifiant élève</label>
                                <input type="text" name="student_uid" value={formData.student_uid} onChange={handleInputChange} placeholder="ex: ES-2026-001" className={inputCls} />
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

                            {/* Birth date */}
                            <div>
                                <label className={labelCls}>Date de naissance</label>
                                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className={inputCls} />
                            </div>

                            {/* Inscription date */}
                            <div>
                                <label className={labelCls}>Date d'inscription</label>
                                <input type="date" name="inscription_date" value={formData.inscription_date} onChange={handleInputChange} className={inputCls} />
                            </div>

                            {/* School ID */}
                            <div>
                                <label className={labelCls}>École (1–13)</label>
                                <select name="school_id" value={formData.school_id} onChange={handleInputChange} className={inputCls}>
                                    <option value="">— Sélectionner —</option>
                                    {SCHOOLS.map(n => (
                                        <option key={n} value={n}>École {n}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Course */}
                            <div className="md:col-span-2">
                                <label className={labelCls}>Cours d'inscription</label>
                                <select name="course_id" value={formData.course_id} onChange={handleInputChange} className={inputCls}>
                                    <option value="">— Aucun cours —</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
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
                                const courseId = student.course_id ? Number(student.course_id) : null;
                                const courseName = courses.find(c => Number(c.id) === courseId)?.title;
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
                                            {student.school_id ? `École ${student.school_id}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                                            {courseName || '—'}
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
