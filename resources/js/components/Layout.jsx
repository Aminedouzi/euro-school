import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const roleLabels = {
    admin: 'Administrateur',
    secretary: 'Secrétaire',
    teacher: 'Professeur',
    student: 'Élève',
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const navLinks = [];
    if (user?.role === 'admin') {
        navLinks.push({ to: '/dashboard', label: 'Tableau de bord' });
        navLinks.push({ to: '/admin/dashboard', label: 'Tableau de bord Admin' });
        navLinks.push({ to: '/admin/users', label: 'Utilisateurs' });
        navLinks.push({ to: '/admin/students', label: 'Élèves' });
        navLinks.push({ to: '/admin/teachers', label: 'Professeurs' });
        navLinks.push({ to: '/admin/schools', label: 'Écoles' });
        navLinks.push({ to: '/admin/courses', label: 'Cours' });
        navLinks.push({ to: '/admin/school-expenses', label: 'Dépenses école' });
        navLinks.push({ to: '/admin/payments', label: 'Paiements' });
        navLinks.push({ to: '/admin/invoices', label: 'Factures' });
        navLinks.push({ to: '/admin/subscriptions', label: 'Abonnements' });
    } else if (user?.role === 'secretary') {
        navLinks.push({ to: '/dashboard', label: 'Tableau de bord' });
        navLinks.push({ to: '/secretary/courses', label: 'Cours & inscriptions' });
        navLinks.push({ to: '/secretary/students', label: 'Élèves' });
    } else if (user?.role === 'teacher') {
        navLinks.push({ to: '/dashboard', label: 'Mes cours' });
        navLinks.push({ to: '/teacher/courses', label: 'Gérer les cours' });
    } else {
        navLinks.push({ to: '/dashboard', label: 'Mes cours' });
        navLinks.push({ to: '/student/catalog', label: 'Catalogue des cours' });
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <header className="lg:hidden sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        ☰ Menu
                    </button>
                    <ThemeToggle minimal />
                </div>
            </header>
            <div className="flex flex-1 min-h-0">
                {isMobileMenuOpen && (
                    <button
                        type="button"
                        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                        aria-label="Fermer le menu"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
                <aside className={`fixed lg:static top-0 left-0 z-40 h-full w-72 max-w-[85vw] lg:w-56 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm dark:shadow-none transition-transform duration-200 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img
                            src="/logo-euroschool.svg"
                            alt="Euro School"
                            className="w-12 h-12"
                        />
                        <span className="font-bold text-slate-800 dark:text-white">Euro School System</span>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {user?.name}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        {roleLabels[user?.role] || user?.role}
                    </span>
                </div>
                <nav className="flex-1 p-2 space-y-0.5">
                    {navLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                                    isActive
                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-2 space-y-2 border-t border-slate-200 dark:border-slate-700">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-0">
                <Outlet />
            </main>
            </div>
        </div>
    );
}
