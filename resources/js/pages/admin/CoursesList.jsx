import { useState, useEffect } from 'react';
import api from '../../api';

const COURSE_TYPES = [
    { value: 'communication', label: 'Communication' },
    { value: 'langue', label: 'Langue' },
];

export default function CoursesList() {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        school_id: '',
        title: '',
        type: 'communication',
        description: '',
        start_date: '',
        end_date: '',
        teacher_id: '',
        max_students: 30,
        is_active: true,
    });

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
        fetchSchools();
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
            console.error('Erreur lors du chargement des professeurs:', err);
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!formData.school_id) {
                setError('Veuillez sélectionner une école');
                return;
            }
            const submitData = {
                ...formData,
                school_id: parseInt(formData.school_id, 10),
                max_students: parseInt(formData.max_students, 10),
            };

            if (editingId) {
                // Update
                await api.put(`/courses/${editingId}`, submitData);
                setEditingId(null);
            } else {
                // Create
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
            school_id: course.school_id || '',
            title: course.title,
            type: course.type,
            description: course.description || '',
            start_date: course.start_date || '',
            end_date: course.end_date || '',
            teacher_id: course.teacher_id || '',
            max_students: course.max_students || 30,
            is_active: course.is_active !== false,
        });
        setEditingId(course.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

        try {
            setError('');
            await api.delete(`/courses/${id}`);
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            school_id: '',
            title: '',
            type: 'communication',
            description: '',
            start_date: '',
            end_date: '',
            teacher_id: '',
            max_students: 30,
            is_active: true,
        });
        setShowForm(false);
        setEditingId(null);
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Cours</h1>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                school_id: schools[0]?.id ?? '',
                                title: '',
                                type: 'communication',
                                description: '',
                                start_date: '',
                                end_date: '',
                                teacher_id: '',
                                max_students: 30,
                                is_active: true,
                            });
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
                    >
                        ➕ Nouveau Cours
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
                        {editingId ? 'Modifier le cours' : 'Créer un nouveau cours'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    École *
                                </label>
                                <select
                                    name="school_id"
                                    value={formData.school_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">— Sélectionner —</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {COURSE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Professeur
                                </label>
                                <select
                                    name="teacher_id"
                                    value={formData.teacher_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Sélectionner un professeur --</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nombre max d'étudiants
                                </label>
                                <input
                                    type="number"
                                    name="max_students"
                                    value={formData.max_students}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Activer ce cours
                            </label>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition w-full sm:w-auto"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition w-full sm:w-auto"
                            >
                                {editingId ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE */}
            {courses.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm min-w-[980px]">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">École</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Titre</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Professeur</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Élèves Max</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {courses.map(course => (
                                <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                        {course.school?.name || '—'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-900 dark:text-white font-medium">{course.title}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            course.type === 'communication'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        }`}>
                                            {COURSE_TYPES.find(t => t.value === course.type)?.label}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{course.teacher?.name || '—'}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{course.max_students || '—'}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {course.start_date && course.end_date ? `${course.start_date} → ${course.end_date}` : '—'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            course.is_active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {course.is_active ? '✓ Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="text-red-600 hover:text-red-700 font-medium transition"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Aucun cours trouvé
                </div>
            )}
        </div>
    );
}
