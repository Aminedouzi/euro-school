import { useState, useEffect } from 'react';
import api from '../../api';

const PAYMENT_METHODS = [
    { value: 'card', label: 'Carte Bancaire' },
    { value: 'bank_transfer', label: 'Virement Bancaire' },
    { value: 'cash', label: 'Espèces' },
    { value: 'check', label: 'Chèque' },
];

const PAYMENT_STATUS = [
    { value: 'pending', label: 'En attente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    { value: 'completed', label: 'Complété', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { value: 'failed', label: 'Échoué', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    { value: 'refunded', label: 'Remboursé', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
];

export default function PaymentsList() {
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        course_id: '',
        amount: '',
        method: 'card',
        status: 'pending',
        reference: '',
        description: '',
        payment_date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    });

    useEffect(() => {
        fetchPayments();
        fetchUsers();
        fetchCourses();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/payments');
            setPayments(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des paiements');
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

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (err) {
            console.error('Erreur lors du chargement des cours:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDateTimeForSubmit = (datetimeString) => {
        if (!datetimeString) return null;
        // Convertir de "YYYY-MM-DDTHH:mm" à "Y-m-d H:i"
        return datetimeString.replace('T', ' ');
    };

    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return '';
        // Convertir de "Y-m-d H:i" à "YYYY-MM-DDTHH:mm"
        return dateString.replace(' ', 'T');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
                payment_date: formatDateTimeForSubmit(formData.payment_date),
            };

            if (editingId) {
                await api.put(`/payments/${editingId}`, submitData);
            } else {
                await api.post('/payments', submitData);
            }
            resetForm();
            await fetchPayments();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (payment) => {
        setFormData({
            user_id: payment.user_id,
            course_id: payment.course_id || '',
            amount: payment.amount,
            method: payment.method,
            status: payment.status,
            reference: payment.reference || '',
            description: payment.description || '',
            payment_date: formatDateTimeForInput(payment.payment_date) || '',
        });
        setEditingId(payment.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

        try {
            setError('');
            await api.delete(`/payments/${id}`);
            await fetchPayments();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: '',
            course_id: '',
            amount: '',
            method: 'card',
            status: 'pending',
            reference: '',
            description: '',
            payment_date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Paiements</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        ➕ Nouveau Paiement
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
                        {editingId ? 'Modifier le paiement' : 'Enregistrer un nouveau paiement'}
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
                                    Cours (optionnel)
                                </label>
                                <select
                                    name="course_id"
                                    value={formData.course_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Aucun cours --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Montant (dh) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Méthode de paiement *
                                </label>
                                <select
                                    name="method"
                                    value={formData.method}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Statut *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    {PAYMENT_STATUS.map(s => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Référence
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date du paiement
                                </label>
                                <input
                                    type="datetime-local"
                                    name="payment_date"
                                    value={formData.payment_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
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
                                {editingId ? 'Modifier' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE */}
            {payments.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Utilisateur</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Montant</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Méthode</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{payment.user_name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">
                                        dh {parseFloat(payment.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {PAYMENT_METHODS.find(m => m.value === payment.method)?.label}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            PAYMENT_STATUS.find(s => s.value === payment.status)?.color
                                        }`}>
                                            {PAYMENT_STATUS.find(s => s.value === payment.status)?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {payment.payment_date || '—'}
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handleEdit(payment)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(payment.id)}
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
                    Aucun paiement trouvé
                </div>
            )}
        </div>
    );
}
