<?php

namespace Database\Seeders;

use App\Models\Course;
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

        $this->call([
            FictiveMoroccanStudentsSeeder::class,
            FictiveMoroccanTeachersSeeder::class,
        ]);

        $teacher = User::where('email', 'fatima.qasimi@euroschool.ma')->first();
        $c1 = Course::create([
            'title' => 'Anglais — niveau A2',
            'type' => 'langue',
            'description' => 'Cours collectif de conversation.',
            'max_students' => 25,
            'is_active' => true,
        ]);
        $c2 = Course::create([
            'title' => 'Communication professionnelle',
            'type' => 'communication',
            'description' => 'Prise de parole et présentations.',
            'max_students' => 20,
            'is_active' => true,
        ]);
        if ($teacher) {
            $c1->teachers()->sync([$teacher->id]);
            $c2->teachers()->sync([$teacher->id]);
        }
    }
}
