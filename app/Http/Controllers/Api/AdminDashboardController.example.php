<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics for admin
     *
     * Cette est un exemple de contrôleur pour le dashboard.
     * Les données actuellement retournées sont des exemples.
     * Pour utiliser les vraies données, consultez les exemples ci-dessous.
     */
    public function getStats()
    {
        // EXEMPLE 1: Récupérer le nombre d'élèves
        // $total_students = User::where('role', 'student')->count();

        // EXEMPLE 2: Récupérer les abonnements actifs
        // Supposant qu'il existe une table 'subscriptions' ou 'course_user'
        // $active_subscriptions = DB::table('course_user')->count();

        // EXEMPLE 3: Recalculer les revenus
        // Si vous avez une table 'payments':
        // $monthly_revenue = DB::table('payments')
        //     ->whereYear('created_at', now()->year)
        //     ->whereMonth('created_at', now()->month)
        //     ->where('status', 'completed')
        //     ->sum('amount');

        // EXEMPLE 4: Paiements en attente
        // $pending_payments = DB::table('payments')
        //     ->where('status', 'pending')
        //     ->sum('amount');

        // DONNÉES ACTUELLES (fictives)
        $total_students = User::where('role', 'student')->count() ?: 875;
        $active_subscriptions = DB::table('course_user')->count() ?: 642;
        $monthly_revenue = 18450.00;
        $pending_payments = 2890.00;

        // Trends (en pourcentage)
        $student_growth = 8;
        $subscription_growth = 12;
        $revenue_growth = 15;

        // Monthly revenue data (last 12 months)
        $monthly_revenue_data = [
            8400, 10200, 9800, 12100, 11800, 13200,
            14500, 15200, 14800, 16100, 17800, 18450
        ];

        // Student distribution by course level
        // EXEMPLE: Connexion réelle à la BD
        // $student_distribution = [
        //     DB::table('course_user')
        //         ->whereHas('course', function($q) { $q->where('level', 'A1'); })
        //         ->count(),
        //     DB::table('course_user')
        //         ->whereHas('course', function($q) { $q->where('level', 'A2'); })
        //         ->count(),
        //     // etc...
        // ];

        $student_distribution = [
            245, // A1 Intro
            185, // A2 Basic
            128, // B1 Inter
            75   // B2 Adv
        ];

        // Recent payments
        // EXEMPLE: Liste réelle des paiements
        // $recent_payments = DB::table('payments')
        //     ->join('users', 'payments.user_id', '=', 'users.id')
        //     ->select('payments.*', 'users.name')
        //     ->orderBy('payments.created_at', 'desc')
        //     ->limit(5)
        //     ->get();

        $recent_payments = [
            [
                'id' => 'PAY001',
                'student' => 'Jean Dupont',
                'date' => now()->subDays(0)->format('Y-m-d'),
                'amount' => 150.00,
                'status' => 'paid'
            ],
            [
                'id' => 'PAY002',
                'student' => 'Marie Martin',
                'date' => now()->subDays(1)->format('Y-m-d'),
                'amount' => 200.00,
                'status' => 'pending'
            ],
            [
                'id' => 'PAY003',
                'student' => 'Pierre Bernard',
                'date' => now()->subDays(2)->format('Y-m-d'),
                'amount' => 175.50,
                'status' => 'paid'
            ],
            [
                'id' => 'PAY004',
                'student' => 'Sophie Laurent',
                'date' => now()->subDays(3)->format('Y-m-d'),
                'amount' => 150.00,
                'status' => 'failed'
            ],
            [
                'id' => 'PAY005',
                'student' => 'Luc Fontaine',
                'date' => now()->subDays(4)->format('Y-m-d'),
                'amount' => 225.00,
                'status' => 'paid'
            ],
        ];

        return response()->json([
            'data' => [
                'total_students' => $total_students,
                'active_subscriptions' => $active_subscriptions,
                'monthly_revenue' => $monthly_revenue,
                'pending_payments' => $pending_payments,
                'student_growth' => $student_growth,
                'subscription_growth' => $subscription_growth,
                'revenue_growth' => $revenue_growth,
                'monthly_revenue_data' => $monthly_revenue_data,
                'student_distribution' => $student_distribution,
                'recent_payments' => $recent_payments,
            ]
        ]);
    }
}
