import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
        navLinks.push({ to: '/dashboard', label: 'Accueil' });
        navLinks.push({ to: '/admin/dashboard', label: 'Statistiques' });
        navLinks.push({ to: '/admin/users', label: 'Utilisateurs' });
        navLinks.push({ to: '/admin/students', label: 'Élèves' });
        navLinks.push({ to: '/admin/teachers', label: 'Professeurs' });
        navLinks.push({ to: '/admin/courses', label: 'Cours' });
    } else if (user?.role === 'secretary') {
        navLinks.push({ to: '/dashboard', label: 'Accueil' });
    } else if (user?.role === 'teacher') {
        navLinks.push({ to: '/dashboard', label: 'Accueil' });
        navLinks.push({ to: '/teacher/courses', label: 'Mes cours' });
    } else {
        navLinks.push({ to: '/dashboard', label: 'Accueil' });
        navLinks.push({ to: '/student/catalog', label: 'Catalogue' });
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <header className="lg:hidden sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((v) => !v)}
                    className="inline-flex items-center justify-center rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                    Menu
                </button>
            </header>
            <div className="flex flex-1 min-h-0">
                {isMobileMenuOpen && (
                    <button
                        type="button"
                        className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                        aria-label="Fermer"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
                <aside
                    className={`fixed lg:static top-0 left-0 z-40 h-full w-64 max-w-[85vw] lg:w-52 shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                >
                    <div className="p-4 border-b border-slate-200">
                        <Link to="/dashboard" className="font-bold text-slate-800">
                            Euro School
                        </Link>
                        <p className="text-xs text-slate-500 mt-2">{user?.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">
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
                                    `block px-3 py-2 rounded text-sm ${
                                        isActive ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-slate-700 hover:bg-slate-50'
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="p-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Déconnexion
                        </button>
                    </div>
                </aside>
                <main className="flex-1 overflow-auto p-4 sm:p-6 bg-white min-h-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
