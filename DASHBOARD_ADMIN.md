# 📊 Dashboard Admin - Euro School System

## Vue d'ensemble
Le dashboard administrateur offre une structure complète de gestion avec KPIs, graphiques et tableaux.

## Structure des Composants

### 1. **AdminDashboard.jsx** (Page principale)
- Récupère les données du backend via `/admin/dashboard-stats`
- Affiche les KPIs, graphiques et tableau des paiements
- Gère le chargement et les erreurs

### 2. **KPICard.jsx** (Cartes d'indicateurs clés)
Affiche 4 KPIs principaux:
- 👥 Total Élèves inscrits
- 📄 Abonnements Actifs
- 💰 Revenu Mensuel
- ⚠️ Paiements en attente

**Props:**
- `title` (string): Titre de l'indicateur
- `value` (string|number): Valeur à afficher
- `icon` (string): Emoji ou icône
- `trend` (number): Pourcentage de croissance
- `warning` (boolean): Mode alerte (orange)

### 3. **RevenueChart.jsx** (Graphique linéaire)
Affiche l'évolution mensuelle du revenu
- Courbe lissée avec dégradé
- Données de janvier à décembre
- Format: € avec milliers

### 4. **StudentDistributionChart.jsx** (Graphique en barres)
Répartition des élèves par niveau:
- A1 Intro
- A2 Basic
- B1 Inter
- B2 Adv

### 5. **RecentPayments.jsx** (Tableau)
Liste les 5 derniers paiements avec:
- ID Paiement
- Nom de l'élève
- Date
- Montant (€)
- Statut (Payé/En attente/Échoué)

## Endpoints API

### GET `/api/admin/dashboard-stats`
**Authentification:** Requise (token Sanctum)

**Réponse:**
```json
{
  "data": {
    "total_students": 875,
    "active_subscriptions": 642,
    "monthly_revenue": 18450.00,
    "pending_payments": 2890.00,
    "student_growth": 8,
    "subscription_growth": 12,
    "revenue_growth": 15,
    "monthly_revenue_data": [...],
    "student_distribution": [...],
    "recent_payments": [...]
  }
}
```

## Accès
- **Route:** `/admin/dashboard`
- **Rôles autorisés:** Administrateurs uniquement
- **Protection:** Authentification et contrôle d'accès par rôle

## Styles
- **Framework:** Tailwind CSS
- **Graphiques:** Chart.js (react-chartjs-2)
- **Thème:** Support du mode sombre (dark mode)

## Utilisation

```jsx
// Dans Root.jsx
import AdminDashboard from './pages/admin/AdminDashboard';

// Route protégée
<Route
    path="admin/dashboard"
    element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
        </ProtectedRoute>
    }
/>
```

## Données Actuelles
Le dashboard utilise actuellement des données mockées dans le contrôleur. Pour intégrer les données réelles:

1. Mettre à jour `AdminDashboardController.php` pour récupérer les données de la BD
2. Ajuster les requêtes en fonction de votre modèle de données
3. Implémenter les API de paiements et abonnements

## À faire
- [ ] Intégrer les vraies données de paiements
- [ ] Connecter aux tables de paiements/abonnements
- [ ] Ajouter des filtres de période
- [ ] Implémenter l'export de données
- [ ] Ajouter des notifications en temps réel
