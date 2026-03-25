import { useState, useEffect } from 'react';
import api from '../../api';

const METHODS = [
    { value: 'bank_transfer', label: 'Virement' },
    { value: 'card', label: 'Carte' },
    { value: 'cash', label: 'Espèces' },
    { value: 'check', label: 'Chèque' },
    { value: 'other', label: 'Autre' },
];

export default function SchoolExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [schools, setSchools] = useState([]);
    const [filterSchoolId, setFilterSchoolId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        school_id: '',
        title: '',
        vendor: '',
        amount: '',
        paid_on: new Date().toISOString().split('T')[0],
        method: 'bank_transfer',
        reference: '',
        notes: '',
    });

    const fetchSchools = async () => {
        const { data } = await api.get('/schools');
        setSchools(data.schools || []);
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError('');
            const params = filterSchoolId ? { school_id: filterSchoolId } : {};
            const { data } = await api.get('/school-expenses', { params });
            setExpenses(data.expenses || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [filterSchoolId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...formData,
                school_id: parseInt(formData.school_id, 10),
                amount: parseFloat(formData.amount),
            };
            if (editingId) {
                await api.put(`/school-expenses/${editingId}`, payload);
            } else {
                await api.post('/school-expenses', payload);
            }
            resetForm();
            await fetchExpenses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (x) => {
        setFormData({
            school_id: String(x.school_id),
            title: x.title,
            vendor: x.vendor || '',
            amount: String(x.amount),
            paid_on: x.paid_on?.slice(0, 10) || '',
            method: x.method || 'bank_transfer',
            reference: x.reference || '',
            notes: x.notes || '',
        });
        setEditingId(x.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette dépense ?')) return;
        try {
            await api.delete(`/school-expenses/${id}`);
            await fetchExpenses();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur');
        }
    };

    const resetForm = () => {
        setFormData({
            school_id: schools[0]?.id ? String(schools[0].id) : '',
            title: '',
            vendor: '',
            amount: '',
            paid_on: new Date().toISOString().split('T')[0],
            method: 'bank_transfer',
            reference: '',
            notes: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white';
    const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

    const methodLabel = (v) => METHODS.find((m) => m.value === v)?.label || v;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dépenses payées (écoles)</h1>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                school_id: schools[0]?.id ? String(schools[0].id) : '',
                                title: '',
                                vendor: '',
                                amount: '',
                                paid_on: new Date().toISOString().split('T')[0],
                                method: 'bank_transfer',
                                reference: '',
                                notes: '',
                            });
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        + Enregistrer une facture payée
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">Filtrer par école</label>
                <select
                    value={filterSchoolId}
                    onChange={(e) => setFilterSchoolId(e.target.value)}
                    className={inputCls + ' max-w-xs'}
                >
                    <option value="">Toutes</option>
                    {schools.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">{error}</div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        {editingId ? 'Modifier la dépense' : 'Nouvelle dépense payée'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                        <div>
                            <label className={labelCls}>École *</label>
                            <select name="school_id" value={formData.school_id} onChange={handleChange} required className={inputCls}>
                                <option value="">—</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Libellé *</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Fournisseur</label>
                            <input name="vendor" value={formData.vendor} onChange={handleChange} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Montant (DH) *</label>
                            <input name="amount" type="number" step="0.01" min="0.01" value={formData.amount} onChange={handleChange} required className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Date de paiement *</label>
                            <input name="paid_on" type="date" value={formData.paid_on} onChange={handleChange} required className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Mode de paiement *</label>
                            <select name="method" value={formData.method} onChange={handleChange} required className={inputCls}>
                                {METHODS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Référence</label>
                            <input name="reference" value={formData.reference} onChange={handleChange} className={inputCls} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className={inputCls} />
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">
                                Annuler
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                                {editingId ? 'Enregistrer' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-slate-500">Chargement...</div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">École</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Libellé</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Fournisseur</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Montant</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Mode</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {expenses.map((x) => (
                                <tr key={x.id}>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {x.paid_on ? new Date(x.paid_on).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-900 dark:text-white">{x.school?.name || '—'}</td>
                                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{x.title}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{x.vendor || '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                        {Number(x.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{methodLabel(x.method)}</td>
                                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                        <button type="button" onClick={() => handleEdit(x)} className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400">Modifier</button>
                                        <button type="button" onClick={() => handleDelete(x.id)} className="px-3 py-1 rounded font-medium transition outline-none text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400">Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {expenses.length === 0 && (
                        <p className="p-8 text-center text-slate-500">Aucune dépense enregistrée</p>
                    )}
                </div>
            )}
        </div>
    );
}
