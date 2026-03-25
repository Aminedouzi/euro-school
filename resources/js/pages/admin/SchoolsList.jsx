import { useState, useEffect } from 'react';
import api from '../../api';

export default function SchoolsList() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', address: '' });

    const fetchSchools = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/schools');
            setSchools(data.schools || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await api.put(`/schools/${editingId}`, formData);
            } else {
                await api.post('/schools', formData);
            }
            resetForm();
            await fetchSchools();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (s) => {
        setFormData({ name: s.name, code: s.code || '', address: s.address || '' });
        setEditingId(s.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette école ? (impossible si des cours ou élèves y sont liés)')) return;
        try {
            await api.delete(`/schools/${id}`);
            await fetchSchools();
        } catch (err) {
            setError(err.response?.data?.message || 'Suppression impossible');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', address: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white';
    const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Écoles</h1>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        + Nouvelle école
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">{error}</div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {editingId ? "Modifier l'école" : 'Ajouter une école'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
                        <div>
                            <label className={labelCls}>Nom *</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Code</label>
                            <input name="code" value={formData.code} onChange={handleChange} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Adresse</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={inputCls} />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">
                                Annuler
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                                {editingId ? 'Enregistrer' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nom</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Code</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Adresse</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {schools.map((s) => (
                            <tr key={s.id}>
                                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{s.name}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.code || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{s.address || '—'}</td>
                                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                    <button type="button" onClick={() => handleEdit(s)} className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400">Modifier</button>
                                    <button type="button" onClick={() => handleDelete(s.id)} className="px-3 py-1 rounded font-medium transition outline-none text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
