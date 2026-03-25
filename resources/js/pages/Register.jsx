import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('student');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== password_confirmation) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setSubmitting(true);
        try {
            await register({ name, email, password, password_confirmation, role, phone: phone || undefined });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message || "Erreur lors de l'inscription.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-lg shadow border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Inscription</h1>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Nom</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Téléphone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Rôle</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
                            <option value="student">Élève</option>
                            <option value="teacher">Professeur</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Confirmation</label>
                        <input type="password" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                        {submitting ? '...' : "S'inscrire"}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    <Link to="/login" className="text-indigo-600 underline">Déjà un compte ?</Link>
                </p>
            </div>
        </div>
    );
}
