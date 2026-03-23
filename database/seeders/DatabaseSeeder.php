<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@euroschool.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
        ]);
        User::create([
            'name' => 'Secrétaire',
            'email' => 'secretary@euroschool.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SECRETARY,
        ]);
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => User::ROLE_STUDENT,
        ]);

        // Run additional seeders
        $this->call([
            FictiveMoroccanStudentsSeeder::class,
            FictiveMoroccanTeachersSeeder::class,
            StudentPaymentsSeeder::class,
        ]);
    }
}
