import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

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
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 px-4">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle minimal />
            </div>
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo-euroschool.svg"
                            alt="Euro School Logo"
                            className="w-32 h-32"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">
                        Euro School
                    </h1>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-8 font-medium">
                        Système de Gestion Scolaire
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="vous@exemple.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
                        >
                            {submitting ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        Pas de compte ?{' '}
                        <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            S&apos;inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
