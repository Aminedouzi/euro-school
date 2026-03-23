import { useState, useEffect } from 'react';
import api from '../../api';

const ROLES = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'secretary', label: 'Secrétaire' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'student', label: 'Étudiant' },
];

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
    });

    // Load users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
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
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/users/${editingId}`, updateData);
                setEditingId(null);
            } else {
                // Create
                if (!formData.password) {
                    setError('Le mot de passe est requis pour créer un utilisateur');
                    return;
                }
                await api.post('/users', formData);
            }
            resetForm();
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            role: user.role,
        });
        setEditingId(user.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            setError('');
            await api.delete(`/users/${id}`);
            await fetchUsers();
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
            role: 'student',
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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Utilisateurs</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
                    >
                        ➕ Nouvel Utilisateur
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
                        {editingId ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nom *
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

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Rôle *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
            {users.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm min-w-[760px]">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nom</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Téléphone</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Rôle</th>
                                <th className="px-3 sm:px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-3 sm:px-6 py-4 text-slate-900 dark:text-white font-medium">{user.name}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="px-3 sm:px-6 py-4 text-slate-600 dark:text-slate-400">{user.phone || '—'}</td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                            user.role === 'secretary' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                            user.role === 'teacher' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        }`}>
                                            {ROLES.find(r => r.value === user.role)?.label}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
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
                    Aucun utilisateur trouvé
                </div>
            )}
        </div>
    );
}
