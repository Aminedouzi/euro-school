import { useState, useEffect } from 'react';
import api from '../../api';

const INVOICE_STATUSES = [
    { value: 'draft', label: 'Brouillon', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
    { value: 'issued', label: 'Émis', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { value: 'paid', label: 'Payé', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { value: 'overdue', label: 'En retard', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    { value: 'cancelled', label: 'Annulé', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
];

export default function InvoicesList() {
    const [invoices, setInvoices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        invoice_number: '',
        user_id: '',
        payment_id: '',
        subtotal: '',
        tax: '0',
        total: '',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        notes: '',
    });

    useEffect(() => {
        fetchInvoices();
        fetchUsers();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.get('/invoices');
            setInvoices(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des factures');
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
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-calculate total
            if (name === 'subtotal' || name === 'tax') {
                const subtotal = parseFloat(updated.subtotal || 0);
                const tax = parseFloat(updated.tax || 0);
                updated.total = (subtotal + tax).toFixed(2);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const submitData = {
                ...formData,
                subtotal: parseFloat(formData.subtotal),
                tax: parseFloat(formData.tax),
                total: parseFloat(formData.total),
            };

            if (editingId) {
                await api.put(`/invoices/${editingId}`, submitData);
            } else {
                await api.post('/invoices', submitData);
            }
            resetForm();
            await fetchInvoices();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (invoice) => {
        setFormData({
            invoice_number: invoice.invoice_number,
            user_id: invoice.user_id,
            payment_id: invoice.payment_id || '',
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            status: invoice.status,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            description: invoice.description || '',
            notes: invoice.notes || '',
        });
        setEditingId(invoice.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

        try {
            setError('');
            await api.delete(`/invoices/${id}`);
            await fetchInvoices();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setFormData({
            invoice_number: '',
            user_id: '',
            payment_id: '',
            subtotal: '',
            tax: '0',
            total: '',
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: '',
            notes: '',
        });
        setShowForm(false);
        setEditingId(null);
    };

const handlePrint = (invoice) => {
        // Create a temporary div with the invoice content
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="padding: 40px; font-family: Arial, sans-serif; color: #1f2937; background: white;">
                <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
                    <h1 style="margin: 0; color: #2563eb; font-size: 32px;">FACTURE</h1>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">N° ${invoice.invoice_number}</p>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div>
                        <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 12px; font-weight: bold;">DE:</h3>
                        <p style="margin: 5px 0; font-size: 14px; color: #374151;">Euro School</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">École Internationale</p>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 12px; font-weight: bold;">POUR:</h3>
                        <p style="margin: 5px 0; font-size: 14px; color: #374151;">${invoice.user_name}</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Client</p>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 12px;">
                    <div>
                        <p style="margin: 5px 0;"><span style="font-weight: bold; color: #374151;">Émise le:</span> <span style="color: #6b7280;">${invoice.issue_date}</span></p>
                        <p style="margin: 5px 0;"><span style="font-weight: bold; color: #374151;">Échéance:</span> <span style="color: #6b7280;">${invoice.due_date}</span></p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 5px 0;"><span style="font-weight: bold; color: #374151;">Statut:</span> <span style="padding: 3px 8px; border-radius: 4px; ${
                            invoice.status === 'paid' ? 'background-color: #dcfce7; color: #166534;' :
                            invoice.status === 'issued' ? 'background-color: #dbeafe; color: #1e40af;' :
                            invoice.status === 'overdue' ? 'background-color: #fee2e2; color: #991b1b;' :
                            invoice.status === 'draft' ? 'background-color: #f1f5f9; color: #334155;' :
                            'background-color: #f3f4f6; color: #374151;'
                        }">${INVOICE_STATUSES.find(s => s.value === invoice.status)?.label}</span></p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #f3f4f6; border: 1px solid #e5e7eb;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 12px;">Description</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 12px;">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border: 1px solid #e5e7eb;">
                            <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151; font-size: 12px;">${invoice.description || 'Service de formation'}</td>
                            <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 12px; font-weight: bold;">dh${parseFloat(invoice.subtotal).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                    <div style="width: 300px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
                            <span style="color: #6b7280;">Sous-total:</span>
                            <span style="color: #374151; font-weight: 600;">dh${parseFloat(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
                            <span style="color: #6b7280;">TVA:</span>
                            <span style="color: #374151; font-weight: 600;">dh${parseFloat(invoice.tax).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #2563eb; border-bottom: 2px solid #2563eb; font-size: 14px; font-weight: bold;">
                            <span style="color: #1f2937;">TOTAL DÛ:</span>
                            <span style="color: #2563eb;">dh${parseFloat(invoice.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                ${invoice.notes ? `
                <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: bold;">NOTES:</h4>
                    <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">${invoice.notes}</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 10px;">Merci pour votre confiance | Euro School - Formation Internationale</p>
                </div>
            </div>
        `;

        // Open print dialog
        const newWindow = window.open('', '', 'height=600,width=800');
        newWindow.document.write('<html><head><title>Facture ' + invoice.invoice_number + '</title></head><body>');
        newWindow.document.write(element.innerHTML);
        newWindow.document.write('</body></html>');
        newWindow.document.close();

        setTimeout(() => {
            newWindow.print();
        }, 250);
    };

    if (loading) {
        return <div className="text-slate-500">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Factures</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        ➕ Nouvelle Facture
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
                        {editingId ? 'Modifier la facture' : 'Créer une nouvelle facture'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    N° Facture *
                                </label>
                                <input
                                    type="text"
                                    name="invoice_number"
                                    value={formData.invoice_number}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="EX. INV-2025-001"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Client *
                                </label>
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Sélectionner un client --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Sous-total (dh) *
                                </label>
                                <input
                                    type="number"
                                    name="subtotal"
                                    value={formData.subtotal}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    TVA (dh)
                                </label>
                                <input
                                    type="number"
                                    name="tax"
                                    value={formData.tax}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Total (dh) *
                                </label>
                                <input
                                    type="number"
                                    name="total"
                                    value={formData.total}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                                />
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
                                    {INVOICE_STATUSES.map(s => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date d'émission *
                                </label>
                                <input
                                    type="date"
                                    name="issue_date"
                                    value={formData.issue_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Date d'échéance *
                                </label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleInputChange}
                                    required
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

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Remarques
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
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
            {invoices.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">N° Facture</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Client</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Montant</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Statut</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-mono font-semibold">{invoice.invoice_number}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{invoice.user_name}</td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                                        dh {parseFloat(invoice.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            INVOICE_STATUSES.find(s => s.value === invoice.status)?.color
                                        }`}>
                                            {INVOICE_STATUSES.find(s => s.value === invoice.status)?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        <div>{invoice.issue_date}</div>
                                        <div className="text-xs">Échéance: {invoice.due_date}</div>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handlePrint(invoice)}
                                            className="text-green-600 hover:text-green-700 font-medium transition"
                                            title="Imprimer la facture"
                                        >
                                            🖨️
                                        </button>
                                        <button
                                            onClick={() => handleEdit(invoice)}
                                            className="px-3 py-1 rounded font-medium transition outline-none text-blue-600 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice.id)}
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
                    Aucune facture trouvée
                </div>
            )}
        </div>
    );
}
