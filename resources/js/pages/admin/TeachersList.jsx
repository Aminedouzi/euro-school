import { useState, useEffect } from 'react';
import api from '../../api';

export default function TeachersList() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    // Load teachers
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/users');
            // Filter only teachers
            setTeachers(data.filter(u => u.role === 'teacher'));
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des professeurs');
        } finally {
            setLoading(false);
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
            if (editingId) {
                // Update
                const updateData = { ...formData, role: 'teacher' };
                if (!updateData.password) delete updateData.password;
                await api.put(`/users/${editingId}`, updateData);
                setEditingId(null);
            } else {
                // Create
                if (!formData.password) {
                    setError('Le mot de passe est requis');
                    return;
                }
                await api.post('/users', { ...formData, role: 'teacher' });
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
        });
        setShowForm(false);
        setEditingId(null);
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Professeurs</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        ➕ Nouveau Professeur
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
                        {editingId ? 'Modifier le professeur' : 'Ajouter un nouveau professeur'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Mot de passe {!editingId && '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingId}
                                    placeholder={editingId ? 'Laisser vide pour ne pas modifier' : ''}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                            >
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
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nom</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Téléphone</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date d'inscription</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {teachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{teacher.name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{teacher.email}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{teacher.phone || '—'}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {new Date(teacher.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
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
                    Aucun professeur trouvé
                </div>
            )}
        </div>
    );
}
