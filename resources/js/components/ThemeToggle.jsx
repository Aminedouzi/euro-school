import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ minimal = false }) {
    const { isDark, toggleTheme } = useTheme();

    // Version minimale pour haut de page
    if (minimal) {
        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition border border-slate-200 bg-white/90 shadow-sm hover:bg-white dark:border-slate-600 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xl"
                title={isDark ? 'Mode Clair' : 'Mode Sombre'}
            >
                {isDark ? '☀️' : '🌙'}
            </button>
        );
    }

    // Version complète pour sidebar
    return (
        <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            title={isDark ? 'Mode Clair' : 'Mode Sombre'}
        >
            <span className="flex items-center gap-2">
                {isDark ? '☀️ Clair' : '🌙 Sombre'}
            </span>
            <span className="text-lg">
                {isDark ? '☀️' : '🌙'}
            </span>
        </button>
    );
}
