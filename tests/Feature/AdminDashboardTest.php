<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_dashboard_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_users',
                'total_students',
                'total_teachers',
                'total_courses',
                'total_enrollments',
            ],
        ]);
    }

    public function test_non_admin_cannot_access_dashboard_stats(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(401);
    }
}
