import { useState, useEffect } from 'react';
import api from '../../api';

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
        course_ids: [],
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
            setError(err.response?.data?.message || 'Erreur chargement élèves');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            const list = Array.isArray(data?.courses) ? data.courses : [];
            setCourses(list);
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
            if (idx === -1) return { ...prev, course_ids: [...ids, courseId] };
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
            payload.course_ids = payload.course_ids?.length ? payload.course_ids : [];

            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
                setEditingId(null);
            } else {
                if (!formData.password) {
                    setError('Mot de passe requis');
                    return;
                }
                await api.post('/users', payload);
            }
            resetForm();
            await fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur sauvegarde');
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
            course_ids: student.course_ids || [],
        });
        setEditingId(student.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet élève ?')) return;
        try {
            await api.delete(`/users/${id}`);
            await fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur suppression');
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
            course_ids: [],
        });
        setShowForm(false);
        setEditingId(null);
    };

    const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded bg-white';

    if (loading) return <div className="text-slate-500">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Élèves</h1>
                {!showForm && (
                    <button type="button" onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                        + Nouvel élève
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

            {showForm && (
                <div className="border border-slate-200 rounded p-4 bg-slate-50">
                    <h2 className="font-semibold mb-3">{editingId ? 'Modifier' : 'Ajouter'} un élève</h2>
                    <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm mb-1">Nom *</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Téléphone</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Mot de passe {!editingId && '*'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingId}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Naissance</label>
                                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Inscription</label>
                                <input type="date" name="inscription_date" value={formData.inscription_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Cours</label>
                            <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white space-y-1">
                                {courses.map(course => (
                                    <label key={course.id} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={(formData.course_ids || []).some(id => Number(id) === Number(course.id))}
                                            onChange={() => handleCourseToggle(course.id)}
                                        />
                                        {course.title}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Annuler</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Nom</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Cours</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            const names = (student.course_ids || [])
                                .map(cid => courses.find(c => Number(c.id) === Number(cid))?.title)
                                .filter(Boolean)
                                .join(', ');
                            return (
                                <tr key={student.id} className="border-t">
                                    <td className="p-2 text-xs font-mono">{student.student_uid || '—'}</td>
                                    <td className="p-2">{student.name}</td>
                                    <td className="p-2">{student.email}</td>
                                    <td className="p-2 text-xs max-w-xs">{names || '—'}</td>
                                    <td className="p-2 space-x-2">
                                        <button type="button" className="text-blue-600" onClick={() => handleEdit(student)}>Modifier</button>
                                        <button type="button" className="text-red-600" onClick={() => handleDelete(student.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {students.length === 0 && <p className="p-4 text-slate-500">Aucun élève.</p>}
            </div>
        </div>
    );
}
