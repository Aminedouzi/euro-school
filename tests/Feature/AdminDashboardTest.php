<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;
    /**
     * Test that admin can access dashboard stats
     */
    public function test_admin_can_access_dashboard_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_students',
                'active_subscriptions',
                'monthly_revenue',
                'pending_payments',
                'student_growth',
                'subscription_growth',
                'revenue_growth',
                'monthly_revenue_data',
                'student_distribution',
                'revenue_by_school',
                'recent_payments',
            ],
        ]);
    }

    /**
     * Test that non-admin users cannot access dashboard stats
     */
    public function test_non_admin_cannot_access_dashboard_stats(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated users cannot access dashboard stats
     */
    public function test_unauthenticated_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(401);
    }
}
