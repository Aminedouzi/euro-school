<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = User::where('role', 'teacher')->get();
        $students = User::where('role', 'student')->get();

        $classData = [
            [
                'name' => 'Classe A',
                'start_date' => Carbon::now()->subWeeks(2),
                'end_date' => Carbon::now()->addMonths(2),
            ],
            [
                'name' => 'Classe B',
                'start_date' => Carbon::now()->subWeeks(1),
                'end_date' => Carbon::now()->addMonths(3),
            ],
        ];

        foreach ($classData as $data) {
            $class = Classroom::create($data);
            // Assign 2 random teachers
            $class->teachers()->attach($teachers->random(min(2, $teachers->count())));
            // Assign 5 random students
            $class->students()->attach($students->random(min(5, $students->count())));
            // Add 4 lesson dates
            for ($i = 1; $i <= 4; $i++) {
                Lesson::create([
                    'class_id' => $class->id,
                    'date' => Carbon::now()->addDays($i * 7),
                    'topic' => 'Leçon ' . $i,
                ]);
            }
        }
        $this->command->info('Classes, teachers, students, and lessons seeded!');
    }
}
