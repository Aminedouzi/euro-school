import { useState, useEffect } from 'react';
import api from '../../api';

const SUBSCRIPTION_STATUSES = [
    { value: 'active', label: 'Actif', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { value: 'inactive', label: 'Inactif', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
    { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    { value: 'expired', label: 'Expiré', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
];

const BILLING_CYCLES = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'annual', label: 'Annuel' },
];

export default function SubscriptionsList() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        plan_name: '',
        plan_type: 'Pro',
        price: '',
        billing_cycle: 'monthly',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        auto_renew: true,
        description: '',
    });

    useEffect(() => {
        fetchSubscriptions();
        fetchUsers();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/subscriptions');
            setSubscriptions(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des abonnements');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
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
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
            };

            if (editingId) {
                await api.put(`/subscriptions/${editingId}`, submitData);
            } else {
                await api.post('/subscriptions', submitData);
            }
            resetForm();
            await fetchSubscriptions();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (subscription) => {
        setFormData({
            user_id: subscription.user_id,
            plan_name: subscription.plan_name,
            plan_type: subscription.plan_type,
            price: subscription.price,
            billing_cycle: subscription.billing_cycle,
            status: subscription.status,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            auto_renew: subscription.auto_renew,
            description: subscription.description || '',
        });
        setEditingId(subscription.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;

        try {
            setError('');
            await api.delete(`/subscriptions/${id}`);
            await fetchSubscriptions();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: '',
            plan_name: '',
            plan_type: 'Pro',
            price: '',
            billing_cycle: 'monthly',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            auto_renew: true,
            description: '',
        });
        setShowForm(false);
        setEditingId(null);
    };

    const getStatusColor = (status) => {
        return SUBSCRIPTION_STATUSES.find(s => s.value === status)?.color || '';
    };

    const getStatusLabel = (status) => {
        return SUBSCRIPTION_STATUSES.find(s => s.value === status)?.label || status;
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Abonnements</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        ➕ Nouvel Abonnement
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
                        {editingId ? 'Modifier l\'abonnement' : 'Créer un nouvel abonnement'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Utilisateur *
                                </label>
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Sélectionner un utilisateur --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nom du Plan *
                                </label>
                                <input
                                    type="text"
                                    name="plan_name"
                                    value={formData.plan_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Starter, Pro, Enterprise..."
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type de Plan *
                                </label>
                                <input
                                    type="text"
                                    name="plan_type"
                                    value={formData.plan_type}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Basic, Standard, Premium..."
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Prix (dh) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Cycle de Facturation *
                                </label>
                                <select
                                    name="billing_cycle"
                                    value={formData.billing_cycle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {BILLING_CYCLES.map(cycle => (
                                        <option key={cycle.value} value={cycle.value}>
                                            {cycle.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Statut
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {SUBSCRIPTION_STATUSES.map(s => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de Début *
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date de Fin *
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="auto_renew"
                                        checked={formData.auto_renew}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Renouvellement Automatique
                                    </span>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
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
                                {editingId ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE */}
            {subscriptions.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Utilisateur</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Plan</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Prix</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Cycle</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {subscriptions.map(subscription => (
                                <tr key={subscription.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                        <div>{subscription.user_name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{subscription.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        <div className="font-semibold">{subscription.plan_name}</div>
                                        <div className="text-xs">{subscription.plan_type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                                        dh{parseFloat(subscription.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {BILLING_CYCLES.find(c => c.value === subscription.billing_cycle)?.label}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                                            {getStatusLabel(subscription.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        <div>{subscription.start_date}</div>
                                        <div>→ {subscription.end_date}</div>
                                        {subscription.auto_renew && <div className="text-green-600 dark:text-green-400">🔄 Auto-renew</div>}
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handleEdit(subscription)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subscription.id)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Aucun abonnement trouvé
                </div>
            )}
        </div>
    );
}
