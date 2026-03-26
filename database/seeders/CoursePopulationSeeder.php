<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class CoursePopulationSeeder extends Seeder
{
    public function run(): void
    {
        $coursesCount = 5;
        $studentsPerCourse = 20;
        $totalStudentsNeeded = $coursesCount * $studentsPerCourse;

        $schoolId = School::query()->value('id') ?? 1;

        $teachers = collect(range(1, max(5, $coursesCount)))->map(function ($i) {
            return User::updateOrCreate(
                ['email' => "teacher{$i}@school.test"],
                [
                    'name' => "Teacher {$i}",
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_TEACHER,
                ]
            );
        });

        $students = collect(range(1, $totalStudentsNeeded))->map(function ($i) {
            return User::updateOrCreate(
                ['email' => "student{$i}@school.test"],
                [
                    'name' => "Student {$i}",
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_STUDENT,
                ]
            );
        });

        $courses = collect(range(1, $coursesCount))->map(function ($i) use ($teachers, $schoolId) {
            return Course::updateOrCreate(
                ['title' => "Course {$i}"],
                [
                    'school_id' => $schoolId,
                    'type' => $i % 2 === 0 ? 'langue' : 'communication',
                    'description' => "Auto-generated course {$i}",
                    'start_date' => now()->addDays($i)->toDateString(),
                    'end_date' => now()->addMonths(3)->addDays($i)->toDateString(),
                    'teacher_id' => $teachers[($i - 1) % $teachers->count()]->id,
                    'max_students' => 25,
                    'is_active' => true,
                ]
            );
        });

        if (Schema::hasTable('course_teacher')) {
            foreach ($courses as $i => $course) {
                $teacherId = $teachers[$i % $teachers->count()]->id;
                $course->teachers()->syncWithoutDetaching([$teacherId]);
            }
        }

        $offset = 0;
        foreach ($courses as $course) {
            $ids = $students->slice($offset, $studentsPerCourse)->pluck('id')->all();
            // Use sync so each generated course ends up with exactly 20 students.
            $course->students()->sync($ids);
            $offset += $studentsPerCourse;
        }

        $this->command?->info("Generated {$coursesCount} courses with {$studentsPerCourse} students each.");
    }
}
