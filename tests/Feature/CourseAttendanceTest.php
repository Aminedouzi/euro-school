<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseSession;
use App\Models\School;
use App\Models\SessionAttendance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private function makeSchool(): School
    {
        return School::create([
            'name' => 'École test',
            'code' => 'ET',
            'address' => null,
        ]);
    }

    private function makeCourse(School $school, User $teacher): Course
    {
        return Course::create([
            'school_id' => $school->id,
            'title' => 'Cours test',
            'type' => 'langue',
            'description' => null,
            'teacher_id' => $teacher->id,
            'max_students' => 30,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_fetch_student_absences_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/admin/students/{$student->id}/absences");

        $response->assertOk();
        $response->assertJsonPath('student.id', $student->id);
        $response->assertJsonCount(0, 'missed_sessions');
    }

    public function test_teacher_can_create_session_and_save_attendance(): void
    {
        $school = $this->makeSchool();
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $course = $this->makeCourse($school, $teacher);
        $course->students()->attach($student->id, ['enrolled_at' => now(), 'status' => 'active']);

        Sanctum::actingAs($teacher);

        $this->postJson("/api/courses/{$course->id}/sessions", [
            'session_date' => '2026-03-20',
            'notes' => 'Test',
        ])->assertCreated();

        $session = CourseSession::where('course_id', $course->id)->first();
        $this->assertNotNull($session);

        $this->putJson("/api/courses/{$course->id}/sessions/{$session->id}/attendance", [
            'attendances' => [
                ['user_id' => $student->id, 'status' => 'absent'],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('session_attendances', [
            'course_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => 'absent',
        ]);
    }

    public function test_admin_absences_includes_missed_sessions(): void
    {
        $school = $this->makeSchool();
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $course = $this->makeCourse($school, $teacher);
        $course->students()->attach($student->id, ['enrolled_at' => now(), 'status' => 'active']);

        $session = CourseSession::create([
            'course_id' => $course->id,
            'session_date' => '2026-02-01',
            'notes' => 'Séance A',
            'created_by' => $admin->id,
        ]);
        SessionAttendance::create([
            'course_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => 'absent',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/admin/students/{$student->id}/absences");

        $response->assertOk();
        $response->assertJsonCount(1, 'missed_sessions');
        $response->assertJsonPath('missed_sessions.0.course_title', $course->title);
    }
}
