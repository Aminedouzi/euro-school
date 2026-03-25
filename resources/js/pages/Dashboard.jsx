import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const roleLabel = { admin: 'administrateur', secretary: 'secrétaire', teacher: 'professeur', student: 'élève' }[user?.role] || user?.role;
    const enrolled = user?.enrolled_courses || [];
    const taught = user?.taught_courses || [];

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Tableau de bord</h1>
            <p className="text-slate-600 mb-6">
                Bienvenue, {user?.name}. Rôle : {roleLabel}.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="font-medium text-slate-800">Profil</h3>
                    <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
                    {user?.phone && <p className="text-sm text-slate-600">{user.phone}</p>}
                </div>
            </div>
            {enrolled.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Mes cours</h2>
                    <ul className="space-y-2">
                        {enrolled.map((c) => (
                            <li key={c.id} className="p-3 bg-white rounded-lg border border-slate-200">
                                {c.title} <span className="text-slate-500 text-sm">({c.type})</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {taught.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-slate-800 mb-3 mt-6">Cours enseignés</h2>
                    <ul className="space-y-2">
                        {taught.map((c) => (
                            <li key={c.id} className="p-3 bg-white rounded-lg border border-slate-200">
                                {c.title} <span className="text-slate-500 text-sm">({c.type})</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
