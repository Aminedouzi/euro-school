import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Euro School — Connexion</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    >
                        {submitting ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-600">
                    <Link to="/register" className="text-indigo-600 underline">Créer un compte</Link>
                </p>
            </div>
        </div>
    );
}
