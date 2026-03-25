import { useState, useEffect } from 'react';
import api from '../../api';

const COURSE_TYPES = [
    { value: 'communication', label: 'Communication' },
    { value: 'langue', label: 'Langue' },
];

export default function CoursesList() {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'communication',
        description: '',
        start_date: '',
        end_date: '',
        teacher_ids: [],
        max_students: 30,
        is_active: true,
    });
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
        fetchStudents();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/users');
            setTeachers(data.filter(u => u.role === 'teacher'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/users');
            setStudents(data.filter(u => u.role === 'student'));
        } catch (err) {
            console.error(err);
        }
    };

    const openStudentModal = (course) => {
        setSelectedCourse(course);
        setSelectedStudentIds((course.students || []).map(s => s.id));
        setShowStudentModal(true);
    };

    const handleStudentSelectChange = (e) => {
        const options = e.target.options;
        const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
        setSelectedStudentIds(selected);
    };

    const handleSaveStudents = async () => {
        if (!selectedCourse) return;
        try {
            await api.put(`/courses/${selectedCourse.id}`, { student_ids: selectedStudentIds });
            setShowStudentModal(false);
            setSelectedCourse(null);
            setSelectedStudentIds([]);
            await fetchCourses();
        } catch {
            alert('Erreur lors de la sauvegarde des élèves');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, options } = e.target;
        if (name === 'teacher_ids') {
            const selected = Array.from(options).filter(o => o.selected).map(o => Number(o.value));
            setFormData(prev => ({ ...prev, teacher_ids: selected }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const submitData = {
                ...formData,
                max_students: parseInt(formData.max_students, 10),
                teacher_ids: formData.teacher_ids,
            };
            if (editingId) {
                await api.put(`/courses/${editingId}`, submitData);
                setEditingId(null);
            } else {
                await api.post('/courses', submitData);
            }
            resetForm();
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            type: course.type,
            description: course.description || '',
            start_date: course.start_date || '',
            end_date: course.end_date || '',
            teacher_ids: (course.teachers || []).map(t => t.id),
            max_students: course.max_students || 30,
            is_active: course.is_active !== false,
        });
        setEditingId(course.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce cours ?')) return;
        try {
            setError('');
            await api.delete(`/courses/${id}`);
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'communication',
            description: '',
            start_date: '',
            end_date: '',
            teacher_ids: [],
            max_students: 30,
            is_active: true,
        });
        setShowForm(false);
        setEditingId(null);
    };

    const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900';

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-800">Cours</h1>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                title: '',
                                type: 'communication',
                                description: '',
                                start_date: '',
                                end_date: '',
                                teacher_ids: [],
                                max_students: 30,
                                is_active: true,
                            });
                            setShowForm(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Nouveau cours
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

            {showForm && (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h2 className="font-semibold mb-3">{editingId ? 'Modifier' : 'Créer'} un cours</h2>
                    <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
                        <div>
                            <label className="block text-sm mb-1">Titre *</label>
                            <input name="title" value={formData.title} onChange={handleInputChange} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Type *</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className={inputCls}>
                                {COURSE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Professeurs (Ctrl+clic)</label>
                            <select
                                name="teacher_ids"
                                multiple
                                value={formData.teacher_ids}
                                onChange={handleInputChange}
                                className={inputCls}
                                size={Math.min(teachers.length, 5) || 3}
                            >
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Places max</label>
                            <input
                                type="number"
                                name="max_students"
                                value={formData.max_students}
                                onChange={handleInputChange}
                                min={1}
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm mb-1">Début</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Fin</label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className={inputCls} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                            Cours actif
                        </label>
                        <div className="flex gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Annuler</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="text-left p-2">Titre</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Profs</th>
                            <th className="text-left p-2">Max</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(c => (
                            <tr key={c.id} className="border-t border-slate-100">
                                <td className="p-2 font-medium">{c.title}</td>
                                <td className="p-2">{COURSE_TYPES.find(t => t.value === c.type)?.label}</td>
                                <td className="p-2">{(c.teachers || []).map(t => t.name).join(', ') || '—'}</td>
                                <td className="p-2">{c.max_students}</td>
                                <td className="p-2 space-x-2">
                                    <button type="button" className="text-blue-600" onClick={() => handleEdit(c)}>Modifier</button>
                                    <button type="button" className="text-red-600" onClick={() => handleDelete(c.id)}>Supprimer</button>
                                    <button type="button" className="text-indigo-600" onClick={() => openStudentModal(c)}>Élèves</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {courses.length === 0 && <p className="p-4 text-slate-500">Aucun cours.</p>}
            </div>

            {showStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow max-w-md w-full p-4">
                        <h3 className="font-semibold mb-2">Élèves : {selectedCourse?.title}</h3>
                        <select
                            multiple
                            value={selectedStudentIds.map(String)}
                            onChange={handleStudentSelectChange}
                            className={`${inputCls} h-40 mb-3`}
                        >
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button type="button" className="px-3 py-1 border rounded" onClick={() => setShowStudentModal(false)}>Fermer</button>
                            <button type="button" className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleSaveStudents}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
