<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            ['title' => 'Allemand', 'type' => 'langue', 'description' => 'Cours de langue allemande', 'start_date' => Carbon::now()->subMonths(2), 'end_date' => Carbon::now()->addMonths(2)],
            ['title' => 'Italien', 'type' => 'langue', 'description' => 'Cours de langue italienne', 'start_date' => Carbon::now()->subMonths(1), 'end_date' => Carbon::now()->addMonths(3)],
            ['title' => 'Espagnol', 'type' => 'langue', 'description' => 'Cours de langue espagnole', 'start_date' => Carbon::now()->subWeeks(3), 'end_date' => Carbon::now()->addMonths(1)],
            ['title' => 'Anglais', 'type' => 'langue', 'description' => 'Cours de langue anglaise', 'start_date' => Carbon::now()->subWeeks(2), 'end_date' => Carbon::now()->addMonths(4)],
            ['title' => 'Néerlandais', 'type' => 'langue', 'description' => 'Cours de langue néerlandaise', 'start_date' => Carbon::now()->subWeeks(1), 'end_date' => Carbon::now()->addMonths(2)],
            ['title' => 'Informatique', 'type' => 'communication', 'description' => 'Cours d\'informatique', 'start_date' => Carbon::now()->subDays(10), 'end_date' => Carbon::now()->addMonths(2)],
            ['title' => 'Français', 'type' => 'langue', 'description' => 'Cours de langue française', 'start_date' => Carbon::now()->subMonths(2), 'end_date' => Carbon::now()->addMonths(2)],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }

        $this->command->info('Cours créés avec succès !');
    }
}
