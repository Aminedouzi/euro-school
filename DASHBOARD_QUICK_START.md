# 📋 Guide Rapide - Dashboard Admin

## 🚀 Démarrage Rapide

### 1. Démarrer les serveurs
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Laravel)
php artisan serve
```

### 2. Accéder à l'application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### 3. Se connecter en tant qu'admin
- Utilisez vos identifiants administrateur
- Vous verrez automatiquement le lien "Tableau de bord Admin" en haut du sidebar

### 4. Cliquer sur "Tableau de bord Admin"
```
Menu de gauche → "Tableau de bord Admin"
   ou
URL directe → http://localhost:5173/admin/dashboard
```

## 📊 Contenu du Dashboard

### KPIs (Haut de la page - 4 cartes)
```
┌─────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ 👥 ÉLÈVES      │ 📄 ABONNEMENTS  │ 💰 REVENU      │ ⚠️ PAIEMENTS     │
│ 875            │ 642              │ €18,450.00     │ €2,890.00        │
│ ↑ 8%          │ ↑ 12%           │ ↑ 15%         │ (En alerte)     │
└─────────────────┴──────────────────┴─────────────────┴──────────────────┘
```

### Graphiques (Milieu - 2 colonnes)
```
┌──────────────────────────────┬──────────────────────────────┐
│ Évolution Revenu Mensuel     │ Répartition Élèves par Groupe│
│ (Courbe lissée)              │ (Barres: A1, A2, B1, B2)     │
│                              │                              │
│  €18k ╱                      │  300 ┃                        │
│       ╱╱                     │      ┃ ███                    │
│  €10k╱╱╱╱                   │  150 ┃ ███ ██  ██              │
│       ╱╱╱╱╱╱╱╱             │    0 ┃ ─── ── ──               │
│ Jan Feb Mar ... Dec          │      A1 A2 B1 B2            │
└──────────────────────────────┴──────────────────────────────┘
```

### Tableau Paiements (Bas)
```
┌─────────┬─────────────────┬────────────┬──────────────┬────────────┐
│ ID      │ Élève           │ Date       │ Montant      │ Statut     │
├─────────┼─────────────────┼────────────┼──────────────┼────────────┤
│ PAY001  │ Jean Dupont     │ 14/03/2025 │ €150.00      │ ✓ Payé    │
│ PAY002  │ Marie Martin    │ 13/03/2025 │ €200.00      │ ⏳ Attente  │
│ PAY003  │ Pierre Bernard  │ 12/03/2025 │ €175.50      │ ✓ Payé    │
│ PAY004  │ Sophie Laurent  │ 11/03/2025 │ €150.00      │ ✗ Échoué  │
│ PAY005  │ Luc Fontaine    │ 10/03/2025 │ €225.00      │ ✓ Payé    │
└─────────┴─────────────────┴────────────┴──────────────┴────────────┘
```

## 🎨 Couleurs et Statuts

### Badges de Statut
- 🟢 **Payé (Vert)**: Paiement complété
- 🟠 **En attente (Orange)**: Paiement en cours
- 🔴 **Échoué (Rouge)**: Paiement refusé

### Thème
- Mode Clair: Interface blanche avec accents bleus
- Mode Sombre: Interface grise avec accents bleus
- Automatique selon les préférences système

## 💾 Données

### Sources Actuelles
Les données affichées sont des exemples mockés dans le contrôleur.

### Pour Utiliser les Vraies Données
1. Ouvrez `app/Http/Controllers/Api/AdminDashboardController.php`
2. Décommentez les exemples de requêtes
3. Adaptez aux noms de vos tables
4. Testez avec des vrais data

Exemple:
```php
// Avant (données mockées)
$total_students = 875;

// Après (vraies données)
$total_students = User::where('role', 'student')->count();
```

## 🔐 Sécurité

- ✅ Authentification requise
- ✅ Accessible uniquement aux administrateurs
- ✅ Token Sanctum obligatoire
- ✅ Les non-admins sont redirigés

## 🛠️ Dépannage

### Le dashboard ne s'affiche pas
- Vérifiez que vous êtes connecté
- Vérifiez que votre rôle est "admin"
- Vérifiez les erreurs dans la console du navigateur (F12)

### Les graphiques ne s'affichent pas
- Vérifiez que Chart.js est installé: `npm list chart.js`
- Vérifiez la console du navigateur pour les erreurs

### Les données ne se chargent pas
- Vérifiez que le serveur Laravel fonctionne (http://localhost:8000)
- Vérifiez que vous êtes authentifié
- Vérifiez les erreurs réseau dans DevTools (F12 → Network)

## 📱 Adaptabilité

- **Mobile** (< 640px): 1 colonne
- **Tablette** (640-1024px): 2 colonnes  
- **Desktop** (> 1024px): 4 colonnes (KPIs), 2 colonnes (graphiques)

## 🔄 Rafraîchissement

Les données sont chargées une fois au montage de la page. Pour les rafraîchir:
- Actualisez la page (F5)
- Naviguez vers une autre page, puis revenez

## ✨ Prochaines Améliorations

- [ ] Filtres par date
- [ ] Export en CSV/PDF
- [ ] Refresh automatique
- [ ] Plus de graphiques
- [ ] Notifications temps réel
- [ ] Plus de détails au clic

## 📧 Support

Pour toute question ou problème, consultez:
1. DASHBOARD_ADMIN.md - Documentation technique
2. DASHBOARD_IMPLEMENTATION.md - Rapport de mise en place
3. Les fichiers de composants (commentaires JSDoc)
